'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Activity, Terminal, Loader2 } from 'lucide-react';
import gsap from 'gsap';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(cardRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
      .from('.login-item', {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all' // Ensure visibility after animation
      }, '-=0.2');

      gsap.to('.scan-line', {
        top: '100%',
        duration: 3,
        repeat: -1,
        ease: 'none',
      });
    }, cardRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(
        `${apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      login('dummy-token', res.data.user);
      toast.success('System Access Granted');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.errors?.[0] || err.response.data.message || 'Access Denied');
      } else {
        toast.error('Unexpected Protocol Error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#ffde00]">
      <div 
        ref={cardRef} 
        style={{ opacity: 1 }} // Global fallback
        className="max-w-md w-full bg-white brutal-border brutal-shadow p-8 md:p-12 relative"
      >
        {/* Scanning Effect */}
        <div className="scan-line absolute left-0 right-0 h-1 bg-[#ff0055]/20 z-10 pointer-events-none top-0"></div>
        
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Terminal className="w-24 h-24 text-black" />
        </div>

        <div className="login-item inline-flex items-center gap-2 bg-black text-[#ffde00] px-3 py-1 brutal-border mb-6">
            <Activity className="w-4 h-4" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">Secure Terminal</span>
        </div>

        <h2 className="login-item text-4xl font-black text-black mb-1 uppercase tracking-tighter italic leading-none">
          AUTH_REQ
        </h2>
        <p className="login-item font-black text-black/40 mb-8 text-[10px] uppercase tracking-widest border-b-2 border-black/10 pb-4">
          Simulation Access Identifier Mandatory
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="login-item">
            <label className="block text-[10px] font-black text-black uppercase mb-2 tracking-[0.2em]">
                &gt; Entry: Identifier
            </label>
            <input
              type="email"
              required
              className="w-full bg-white brutal-border py-4 px-6 text-black font-black text-lg focus:bg-gray-50 focus:outline-none placeholder:text-gray-200"
              placeholder="USER_ID@SIM.VAULT"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-item">
            <label className="block text-[10px] font-black text-black uppercase mb-2 tracking-[0.2em]">
                &gt; Entry: Credentials
            </label>
            <input
              type="password"
              required
              className="w-full bg-white brutal-border py-4 px-6 text-black font-black text-lg focus:bg-gray-50 focus:outline-none placeholder:text-gray-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ opacity: 1 }} // Emergency fallback
            className="login-item w-full bg-[#ff0055] text-white font-black py-5 brutal-border brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase flex items-center justify-center gap-3 text-xl tracking-tighter disabled:opacity-50 group mt-4"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>INIT_AUTH</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="login-item mt-10 text-center text-[10px] font-black uppercase tracking-widest text-black/30">
          Component Missing?{' '}
          <Link
            href="/register"
            className="text-black hover:text-[#ff0055] underline decoration-4 underline-offset-8"
          >
            Deploy New Identity
          </Link>
        </p>
      </div>
    </main>
  );
}
