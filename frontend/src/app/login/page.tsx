'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Activity, Terminal } from 'lucide-react';
import gsap from 'gsap';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(cardRef.current, {
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'back.out(1.7)',
      })
      .from('.login-item', {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.4');

      // Scanning line animation
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
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#ffde00]">
      <div 
        ref={cardRef} 
        className="max-w-md w-full bg-white brutal-border brutal-shadow p-12 relative overflow-hidden"
      >
        {/* Scanning Effect */}
        <div className="scan-line absolute left-0 right-0 h-1 bg-[#ff0055]/20 z-10 pointer-events-none top-0"></div>
        
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Terminal className="w-32 h-32 text-black" />
        </div>

        <div className="login-item inline-flex items-center gap-2 bg-black text-[#ffde00] px-3 py-1 brutal-border mb-6">
            <Activity className="w-4 h-4" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">Secure Terminal V.08</span>
        </div>

        <h2 className="login-item text-5xl font-black text-black mb-1 uppercase tracking-tighter italic leading-none">
          AUTH_REQ
        </h2>
        <p className="login-item font-black text-black/40 mb-10 text-[10px] uppercase tracking-widest border-b-2 border-black/10 pb-6">
          Simulation Access Identifier Mandatory
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="login-item">
            <label className="block text-[10px] font-black text-black uppercase mb-3 tracking-[0.2em]">
                &gt; Entry: Identifier
            </label>
            <input
              type="email"
              required
              className="w-full bg-white brutal-border py-5 px-6 text-black font-black uppercase tracking-tighter text-xl focus:bg-gray-50 focus:outline-none placeholder:text-gray-200"
              placeholder="USER_ID@SIM.VAULT"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-item">
            <label className="block text-[10px] font-black text-black uppercase mb-3 tracking-[0.2em]">
                &gt; Entry: Credentials
            </label>
            <input
              type="password"
              required
              className="w-full bg-white brutal-border py-5 px-6 text-black font-black uppercase tracking-tighter text-xl focus:bg-gray-50 focus:outline-none placeholder:text-gray-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-item w-full bg-[#ff0055] text-white font-black py-6 brutal-border brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase flex items-center justify-center gap-4 text-2xl tracking-tighter disabled:opacity-50 group"
          >
            {loading ? (
              <LoaderCircle className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <span>INIT_AUTH</span>
                <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="login-item mt-12 text-center text-[10px] font-black uppercase tracking-widest text-black/30">
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

function LoaderCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    )
}
