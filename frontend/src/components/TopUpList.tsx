'use client';

import React, { useEffect, useRef } from 'react';
import { ShoppingBag, Loader2, Sparkles, Zap, Activity } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface TopUpPackage {
  id: string;
  price: number;
  points: number;
  bonus: number;
}

interface TopUpListProps {
  packages: TopUpPackage[];
  loadingId: string | null;
  onTopUp: (pkg: TopUpPackage) => void;
}

export default function TopUpList({ packages, loadingId, onTopUp }: TopUpListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = containerRef.current?.querySelectorAll('.topup-card');
      if (cards && cards.length > 0) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 95%',
            toggleActions: 'play none none none',
          },
          y: 60,
          opacity: 0,
          scale: 0.8,
          rotationX: 30, // 3D entry
          skewX: -5,
          duration: 0.7,
          stagger: {
            amount: 0.4,
            from: 'start'
          },
          ease: 'back.out(2)', // Snappy bounce
          clearProps: 'all'
        });
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="topup-section" className="py-8" ref={containerRef}>
      {/* INDUSTRIAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="flex items-center gap-6">
            <div className="bg-black p-5 brutal-border rotate-[-2deg]">
                <Activity className="w-10 h-10 text-[#ffde00]" />
            </div>
            <div>
                <h3 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-black">
                    CREDIT_CORE
                </h3>
                <p className="font-black text-[10px] uppercase text-gray-400 tracking-[0.3em] mt-2">
                    Direct Injection Protocol v4.02
                </p>
            </div>
        </div>
        <div className="bg-white px-6 py-3 brutal-border flex items-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-black text-xs uppercase italic">Nodes: Synchronized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 brutal-border overflow-hidden bg-black">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="topup-card group relative bg-white hover:bg-[#ffde00] transition-colors cursor-pointer p-10 flex flex-col items-start border-r-4 last:border-r-0 border-black"
            onClick={() => loadingId !== pkg.id && onTopUp(pkg)}
          >
            {pkg.bonus > 0 && (
              <div className="absolute top-4 right-4 bg-[#ff0055] text-white text-[10px] font-black px-3 py-1 brutal-border z-20 shadow-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                BONUS: {pkg.bonus}
              </div>
            )}

            <Zap className="w-10 h-10 text-black mb-8 group-hover:rotate-12 group-hover:fill-black transition-transform" />

            <div className="mb-2">
              <span className="text-7xl font-black text-black tracking-tighter leading-none group-hover:italic transition-all">
                {pkg.points}
              </span>
              <p className="text-black font-black text-xs uppercase tracking-widest mt-2 bg-black text-white px-2 inline-block">Token Units</p>
            </div>
            
            <div className="w-full h-1 bg-black/10 my-10"></div>

            <div className="flex flex-col mb-10">
              <span className="text-[10px] font-bold uppercase text-gray-400 mb-2 italic">Operation Cost:</span>
              <span className="text-2xl font-black text-black italic">
                IDR {pkg.price.toLocaleString('id-ID')}
              </span>
            </div>

            <button className="w-full mt-auto bg-black text-white py-4 font-black uppercase text-sm brutal-border hover:bg-white hover:text-black transition-all">
                INITIALIZE_DEPOT
            </button>

            {loadingId === pkg.id && (
              <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center">
                <Loader2 className="w-14 h-14 text-[#ff0055] animate-spin mb-4" />
                <span className="font-black uppercase text-xs tracking-widest animate-pulse">DEPOTING...</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
