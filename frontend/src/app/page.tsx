'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useSnap } from '../hooks/useSnap';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TopUpList, { TopUpPackage } from '../components/TopUpList';
import RedeemList, { RewardItem } from '../components/RedeemList';
import { CheckCircle2, XCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    type: 'Legend',
  },
  {
    id: 'r2',
    name: 'Elden Ring',
    cost: 7500,
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    type: 'Mythic',
  },
  {
    id: 'r3',
    name: 'Forza Horizon 5',
    cost: 6000,
    image:
      'https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=800&auto=format&fit=crop',
    type: 'Epic',
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
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const { snap, snapEmbed } = useSnap();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
        if (footerRef.current) {
            gsap.from(footerRef.current, {
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: 'top bottom-=20',
                    toggleActions: 'play none none none',
                },
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                clearProps: 'all'
            });
        }
        setTimeout(() => ScrollTrigger.refresh(), 200);
    });

    return () => {
        ctx.revert();
        ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // --- HANDLERS ---
  const handleTopUp = async (pkg: TopUpPackage) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(pkg.id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(
        `${apiUrl}/payment/charge`,
        {
          packageId: pkg.id,
        },
        {
          withCredentials: true,
        },
      );

      const { token, orderId } = response.data;

      if (snap) {
        snap.pay(token, {
          onSuccess: function (result: SnapResult) {
            toast.success('Payment Success! Syncing...', { icon: <CheckCircle2 /> });
            checkTransactionStatus(result.order_id);
          },
          onPending: function () {
            toast('Waiting for payment...', { icon: '⏳' });
          },
          onError: function () {
            toast.error('Payment Error!', { icon: <XCircle /> });
          },
          onClose: function () {
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
        toast.success('Credits deployed to account!');
        refreshUser();
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
      toast.error('Insufficient Credits! Purchase more points.');
      return;
    }

    toast(
      (t) => (
        <div className="flex flex-col gap-4 p-4">
          <span className="font-black uppercase text-sm italic">
            Authorize redemption: {item.name}?
          </span>
          <div className="flex gap-3">
            <button
              className="bg-black text-white px-4 py-2 brutal-border font-black uppercase text-xs hover:bg-[#ff0055]"
              onClick={() => {
                toast.dismiss(t.id);
                processRedeem(item);
              }}
            >
              APPROVE
            </button>
            <button
              className="bg-white text-black px-4 py-2 brutal-border font-black uppercase text-xs hover:bg-gray-100"
              onClick={() => toast.dismiss(t.id)}
            >
              ABORT
            </button>
          </div>
        </div>
      ),
      {
        duration: 8000,
        className: 'brutal-border brutal-shadow !rounded-none !bg-white !text-black',
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
      refreshUser();
    })();

    toast.promise(redeemPromise, {
      loading: 'Authorizing loot transfer...',
      success: `Authorized! ${item.name} is yours.`,
      error: 'Authorization failed.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf6e3]">
      {snapEmbed}

      <Navbar />

      <main className="flex-grow">
        {/* Full Width Hero */}
        <Hero />

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
          <div id="topup-section" className="space-y-12">
              <TopUpList
                  packages={TOP_UP_PACKAGES}
                  loadingId={loading}
                  onTopUp={handleTopUp}
              />
              
              <div className="w-full h-1 bg-black opacity-10"></div>
              
              <RedeemList
                  items={REWARD_CATALOG}
                  userPoints={user?.points || 0}
                  onRedeem={handleRedeem}
              />
          </div>
        </div>
      </main>

      <footer 
        ref={footerRef} 
        style={{ opacity: 1 }} 
        className="w-full bg-black text-white py-12 brutal-border-t border-white"
      >
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="flex items-center space-x-3">
                      <div className="bg-[#ff0055] p-3 brutal-border-white">
                          <span className="font-black text-2xl text-white">N</span>
                      </div>
                      <span className="font-black text-3xl uppercase tracking-tighter italic">NATSTORE.SYSTEM</span>
                  </div>
                  <p className="text-[10px] font-bold text-neutral-500 max-w-sm text-center md:text-left uppercase tracking-widest">
                    COMMITTING DIGITAL ASSETS TO THE BLOCK SINCE 2026. ALL ASSETS SUBJECT TO SIMULATION PROTOCOLS.
                  </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 font-black uppercase text-xs tracking-widest text-[#ffde00]">
                  <span className="hover:text-white cursor-pointer transition-colors border-b-2 border-transparent hover:border-white text-white">Security</span>
                  <span className="hover:text-white cursor-pointer transition-colors border-b-2 border-transparent hover:border-white">Architecture</span>
                  <span className="hover:text-white cursor-pointer transition-colors border-b-2 border-transparent hover:border-white">Infrastructure</span>
              </div>
          </div>
      </footer>
    </div>
  );
}
