'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useSnap } from '../hooks/useSnap';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TopUpList, { TopUpPackage } from '../components/TopUpList';
import RedeemList, { RewardItem } from '../components/RedeemList';

// --- DATA ---
const TOP_UP_PACKAGES: TopUpPackage[] = [
  { id: 'p1', price: 15000, points: 1000, bonus: 0 },
  { id: 'p2', price: 30000, points: 2200, bonus: 200 },
  { id: 'p3', price: 50000, points: 4000, bonus: 500 },
  { id: 'p4', price: 100000, points: 10000, bonus: 2000 },
];

const REWARD_CATALOG: RewardItem[] = [
  {
    id: 'r1',
    name: 'Cyberpunk 2077',
    cost: 5000,
    image:
      'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=800&auto=format&fit=crop',
    type: 'RPG',
  },
  {
    id: 'r2',
    name: 'Elden Ring',
    cost: 7500,
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    type: 'Action',
  },
  {
    id: 'r3',
    name: 'Forza Horizon 5',
    cost: 6000,
    image:
      'https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=800&auto=format&fit=crop',
    type: 'Racing',
  },
  {
    id: 'r4',
    name: 'Red Dead Redemption 2',
    cost: 8000,
    image:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
    type: 'Open World',
  },
];

// Define SnapResult interface
interface SnapResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  pdf_url?: string;
  finish_redirect_url?: string;
}

export default function Home() {
  const { user, refreshUser } = useAuth(); // Use global auth state
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const { snap, snapEmbed } = useSnap();

  // --- HANDLERS ---
  const handleTopUp = async (pkg: TopUpPackage) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(pkg.id);
    try {
      // SECURE: Send only packageId to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(
        `${apiUrl}/payment/charge`,
        {
          packageId: pkg.id, // Backend looks up price
        },
        {
          withCredentials: true, // Send HttpOnly cookie
        },
      );

      const { token, orderId } = response.data;

      if (snap) {
        snap.pay(token, {
          onSuccess: function (result: SnapResult) {
            toast.success('Payment Success! Checking points...', { duration: 3000 });
            checkTransactionStatus(result.order_id);
          },
          onPending: function (result: SnapResult) {
            toast('Waiting for payment...', { icon: '⏳' });
          },
          onError: function (result: SnapResult) {
            toast.error('Payment Failed!');
          },
          onClose: function () {
            console.log('Popup closed, checking status for', orderId);
            checkTransactionStatus(orderId);
          },
        });
      }
    } catch (error: unknown) {
      console.error('Top Up Error:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || 'Failed to initiate top up');
      } else {
        toast.error('Failed to initiate top up');
      }
    } finally {
      setLoading(null);
    }
  };

  const checkTransactionStatus = async (orderId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${apiUrl}/payment/status/${orderId}`, {
        withCredentials: true,
      });

      if (res.data.status === 'settlement' || res.data.status === 'capture') {
        toast.success('Points added successfully!');
        refreshUser();
      } else {
        toast.error(`Transaction status: ${res.data.status}`);
      }
    } catch (err) {
      console.error('Status check failed', err);
    }
  };

  const handleRedeem = async (item: RewardItem) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.points < item.cost) {
      toast.error('Not enough points! Please top up first.');
      return;
    }

    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span className="font-medium">
            Redeem {item.name} for {item.cost} points?
          </span>
          <div className="flex gap-2 mt-1">
            <button
              className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 transition"
              onClick={() => {
                toast.dismiss(t.id);
                processRedeem(item);
              }}
            >
              Confirm
            </button>
            <button
              className="bg-neutral-700 text-white px-3 py-1 rounded-md text-sm hover:bg-neutral-600 transition"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
      },
    );
  };

  const processRedeem = async (item: RewardItem) => {
    const redeemPromise = (async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await axios.post(
        `${apiUrl}/redeem`,
        {
          itemId: item.id,
        },
        { withCredentials: true },
      );
      refreshUser(); // Update points
    })();

    toast.promise(redeemPromise, {
      loading: 'Redeeming reward...',
      success: `Success! You got ${item.name}`,
      error: (err) => {
        if (axios.isAxiosError(err) && err.response) {
          return err.response.data?.message || 'Redeem failed';
        }
        return 'Redeem failed';
      },
    });
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {snapEmbed}

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        <Hero />

        <div id="topup-section">
          <TopUpList
            packages={TOP_UP_PACKAGES}
            loadingId={loading}
            onTopUp={handleTopUp}
          />
        </div>

        <RedeemList
          items={REWARD_CATALOG}
          userPoints={user?.points || 0}
          onRedeem={handleRedeem}
        />
      </div>
    </main>
  );
}
