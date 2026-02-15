'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useSnap } from '../hooks/useSnap';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TopUpList, { TopUpPackage } from '../components/TopUpList';
import RedeemList, { RewardItem } from '../components/RedeemList';

// --- DATA ---
const TOP_UP_PACKAGES: TopUpPackage[] = [
  { id: 'p1', price: 15000, points: 100, bonus: 0 },
  { id: 'p2', price: 30000, points: 220, bonus: 20 },
  { id: 'p3', price: 50000, points: 400, bonus: 50 },
  { id: 'p4', price: 100000, points: 1000, bonus: 200 },
];

const REWARD_CATALOG: RewardItem[] = [
  {
    id: 'r1',
    name: 'Skin Hero: Cyberblade',
    cost: 150,
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop',
    type: 'Rare',
  },
  {
    id: 'r2',
    name: 'Effect: Neon Trail',
    cost: 300,
    image:
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=400&auto=format&fit=crop',
    type: 'Epic',
  },
  {
    id: 'r3',
    name: 'Avatar Border: Gold',
    cost: 500,
    image:
      'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400&auto=format&fit=crop', // Gold texture/abstract
    type: 'Legend',
  },
  {
    id: 'r4',
    name: 'Pass: Monthly VIP',
    cost: 900,
    image:
      'https://images.unsplash.com/photo-1628260412297-a3377e45006f?q=80&w=400&auto=format&fit=crop', // Futuristic Card/Pass
    type: 'Mythic',
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

      const { token } = response.data;

      if (snap) {
        snap.pay(token, {
          onSuccess: function (result: SnapResult) {
            alert(`Payment Success! Points will be added shortly.`);
            console.log(result);
            refreshUser(); // Refresh points from DB
          },
          onPending: function (result: SnapResult) {
            alert('Waiting for payment!');
            console.log(result);
          },
          onError: function (result: SnapResult) {
            alert('Payment Failed!');
            console.log(result);
          },
          onClose: function () {
            console.log('Popup closed');
          },
        });
      }
    } catch (error: unknown) {
      console.error('Top Up Error:', error);
      if (axios.isAxiosError(error) && error.response) {
          alert(error.response.data?.message || 'Failed to initiate top up');
      } else {
          alert('Failed to initiate top up');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleRedeem = async (item: RewardItem) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.points < item.cost) {
      alert('Points not enough! Top up first.');
      return;
    }

    const confirm = window.confirm(`Redeem ${item.name} for ${item.cost} points?`);
    if (confirm) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await axios.post(
          `${apiUrl}/redeem`,
          {
            cost: item.cost,
            itemName: item.name,
          },
          { withCredentials: true },
        );

        alert(`Success! You got ${item.name}`);
        refreshUser(); // Update points
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            alert(error.response.data?.message || 'Redeem failed');
        } else {
            alert('Redeem failed');
        }
      }
    }
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {snapEmbed}

      <Navbar userPoints={user?.points || 0} />

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
