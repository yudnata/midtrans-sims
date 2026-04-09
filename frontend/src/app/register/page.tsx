'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { UserPlus, ArrowRight, Dna, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import gsap from 'gsap';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(cardRef.current, {
        x: 100,
        opacity: 0,
        rotate: 5,
        duration: 0.8,
        ease: 'back.out(1.7)',
      })
      .from('.reg-item', {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
      }, '-=0.4');

      // Grid pulse animation
      gsap.to('.grid-pulse', {
        opacity: 0.4,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, cardRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${apiUrl}/auth/register`, { name, email, password });

      toast.success('Identity Created. Please Authenticate.');
      window.location.href = '/login';
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(
          err.response.data.errors?.[0] || err.response.data.message || 'Registry Rejection',
        );
      } else {
        toast.error('Unexpected Protocol Error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#00d2ff]">
      <div 
        ref={cardRef} 
        className="max-w-md w-full bg-white brutal-border brutal-shadow p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Dna className="w-40 h-40 text-black" />
        </div>

        <div className="reg-item inline-flex items-center gap-2 bg-black text-[#00d2ff] px-4 py-1 brutal-border mb-8">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">Identity Registry Node</span>
        </div>

        <h2 className="reg-item text-4xl font-black text-black mb-1 uppercase tracking-tighter italic leading-none">
          CREATE_ENT
        </h2>
        <p className="reg-item font-black text-black/40 mb-10 text-[10px] uppercase tracking-widest border-b-2 border-black/10 pb-6">
          Initialize New Component Within Global System
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="reg-item">
            <label className="block text-[10px] font-black text-black uppercase mb-2 tracking-[0.2em]">
              &gt; Assign: Alias
            </label>
            <input
              type="text"
              required
              className="w-full bg-white brutal-border py-4 px-6 text-black font-black uppercase tracking-tighter text-lg focus:bg-gray-50 focus:outline-none placeholder:text-gray-200"
              placeholder="OPERATOR_CODE"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="reg-item">
            <label className="block text-[10px] font-black text-black uppercase mb-2 tracking-[0.2em]">
              &gt; Assign: Mail_Link
            </label>
            <input
              type="email"
              required
              className="w-full bg-white brutal-border py-4 px-6 text-black font-black uppercase tracking-tighter text-lg focus:bg-gray-50 focus:outline-none placeholder:text-gray-200"
              placeholder="USER_CONTACT@SIM.SYS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="reg-item">
            <label className="block text-[10px] font-black text-black uppercase mb-2 tracking-[0.2em]">
              &gt; Assign: Key_Safe
            </label>
            <input
              type="password"
              required
              className="w-full bg-white brutal-border py-4 px-6 text-black font-black uppercase tracking-tighter text-lg focus:bg-gray-50 focus:outline-none placeholder:text-gray-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="reg-item w-full bg-black text-white font-black py-6 brutal-border brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase flex items-center justify-center gap-4 text-xl tracking-widest disabled:opacity-50 group"
          >
            {loading ? (
              <span className="animate-pulse">COMMITTING...</span>
            ) : (
              <>
                <span>COMMIT_IDENTITY</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="reg-item mt-12 text-center text-[10px] font-black uppercase tracking-widest text-black/30">
          Already Synched?{' '}
          <Link
            href="/login"
            className="text-black hover:text-[#ff0055] underline decoration-4 underline-offset-8"
          >
            Access Terminal
          </Link>
        </p>
      </div>
    </main>
  );
}
