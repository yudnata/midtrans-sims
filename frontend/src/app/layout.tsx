import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Midtrans Brutal Simulation',
  description: 'Payment simulation with Brutalist aesthetic',
};

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} antialiased`}>
        <AuthProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              className: 'brutal-border brutal-shadow-sm font-mono',
              style: {
                background: '#fff',
                color: '#000',
                border: '3px solid #000',
                borderRadius: '0px',
                padding: '12px 20px',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
