const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIG ---
// Midtrans Snap
let snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Top Up Packages (Backend Source of Truth)
const TOP_UP_PACKAGES = {
    'p1': { price: 15000, points: 100 },
    'p2': { price: 30000, points: 220 },
    'p3': { price: 50000, points: 400 },
    'p4': { price: 100000, points: 1000 },
};

// --- MIDDLEWARE ---
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true // Allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token; // HttpOnly cookie
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey', (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
};

// --- ROUTES: AUTH ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, points',
            [name, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered', user: newUser.rows[0] });
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1h' });

        // Set HttpOnly Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // True in production (HTTPS)
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });

        res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, points: user.points } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Current User
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, points FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

// --- ROUTES: PAYMENT ---

// Create Transaction (Secure)
app.post('/api/payment/charge', authenticateToken, async (req, res) => {
    const { packageId } = req.body; // Only accept ID, lookup price in backend!

    if (!TOP_UP_PACKAGES[packageId]) {
        return res.status(400).json({ message: 'Invalid package ID' });
    }

    const pkg = TOP_UP_PACKAGES[packageId];
    const orderId = `ORDER-${uuidv4()}`;

    try {
        // 1. Create Transaction in DB (Pending)
        await db.query(
            'INSERT INTO transactions (id, order_id, user_id, amount, points_added, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [uuidv4(), orderId, req.user.id, pkg.price, pkg.points, 'pending']
        );

        // 2. Create Midtrans Snap Token
        let parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: pkg.price
            },
            credit_card: { secure: true },
            customer_details: {
                email: req.user.email, // Use authenticated user data
            }
        };

        const transaction = await snap.createTransaction(parameter);
        res.json({ token: transaction.token, redirect_url: transaction.redirect_url });

    } catch (err) {
        console.error('Charge Error:', err);
        res.status(500).json({ message: 'Transaction failed' });
    }
});

// Webhook Notification (Secure)
app.post('/api/payment/notification', async (req, res) => {
    try {
        const notificationJson = req.body;
        
        // 1. Verify Signature Key (Security Check)
        const orderId = notificationJson.order_id;
        const statusCode = notificationJson.status_code;
        const grossAmount = notificationJson.gross_amount;
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        
        const mySignature = crypto.createHash('sha512')
            .update(orderId + statusCode + grossAmount + serverKey)
            .digest('hex');

        if (notificationJson.signature_key !== mySignature) {
            console.error('Invalid Signature Key');
            return res.status(403).json({ message: 'Invalid Signature' });
        }

        const transactionStatus = notificationJson.transaction_status;
        const fraudStatus = notificationJson.fraud_status;

        console.log(`Notification: ${orderId} | ${transactionStatus} | ${fraudStatus}`);

        // 2. Update Database (Atomic Transaction)
        // Check if transaction exists
        const trxCheck = await db.query('SELECT * FROM transactions WHERE order_id = $1', [orderId]);
        if (trxCheck.rows.length === 0) return res.status(404).json({ message: 'Transaction not found' });
        
        const trx = trxCheck.rows[0];
        
        // Only process if status is still pending to avoid double credit
        if (trx.status === 'success') return res.status(200).send('OK');

        let newStatus = 'pending';
        let success = false;

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'accept') {
                newStatus = 'success';
                success = true;
            }
        } else if (transactionStatus == 'settlement') {
            newStatus = 'success';
            success = true;
        } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
            newStatus = 'failed';
        }

        if (success) {
            // Start Transaction Block
            const client = await db.pool.connect();
            try {
                await client.query('BEGIN');
                
                // Update Transaction Status
                await client.query('UPDATE transactions SET status = $1 WHERE order_id = $2', ['success', orderId]);
                
                // Add Points to User
                await client.query('UPDATE users SET points = points + $1 WHERE id = $2', [trx.points_added, trx.user_id]);
                
                await client.query('COMMIT');
                console.log(`Transaction ${orderId} Success! Points added.`);
            } catch (e) {
                await client.query('ROLLBACK');
                console.error('Database transaction error', e);
                throw e;
            } finally {
                client.release();
            }
        } else if (newStatus === 'failed') {
            await db.query('UPDATE transactions SET status = $1 WHERE order_id = $2', ['failed', orderId]);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Notification Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Redeem Points (Secure)
app.post('/api/redeem', authenticateToken, async (req, res) => {
    const { cost, itemName } = req.body;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Check Balance (Lock row for update to prevent race condition)
        const userRes = await client.query('SELECT points FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
        const currentPoints = userRes.rows[0].points;

        if (currentPoints < cost) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Insufficient points' });
        }

        // Deduct Points
        await client.query('UPDATE users SET points = points - $1 WHERE id = $2', [cost, req.user.id]);
        
        // (Optional) Log redemption to a history table here...

        await client.query('COMMIT');
        res.json({ message: `Redeemed ${itemName} successfully`, remainingPoints: currentPoints - cost });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Redeem error' });
    } finally {
        client.release();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
