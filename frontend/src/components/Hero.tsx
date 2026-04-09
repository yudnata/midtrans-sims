'use client';

import React, { useEffect, useRef } from 'react';
import { CreditCard, Zap, Star, ArrowUpRight, Shield, Globe } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(marqueeRef.current, {
        xPercent: -50,
        repeat: -1,
        duration: 40,
        ease: 'none',
      });

      const tl = gsap.timeline();
      tl.from('.hero-content > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      })
      .from('.sticker', {
        scale: 0,
        rotation: -45,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.5)',
      }, '-=0.4');

      gsap.to('.sticker', {
        y: 'random(-10, 10)',
        rotation: 'random(-10, 10)',
        duration: 'random(2, 4)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div 
        ref={containerRef}
        className="relative min-h-[90vh] lg:min-h-screen bg-[#ffde00] brutal-border-b border-black overflow-hidden flex items-center py-12"
    >
      <div className="absolute top-0 left-0 w-full overflow-hidden whitespace-nowrap py-3 bg-white brutal-border-b border-black z-40">
        <div ref={marqueeRef} className="inline-block">
          {[...Array(15)].map((_, i) => (
            <span key={i} className="text-black font-black uppercase tracking-[0.2em] text-[10px] mx-12 italic">
              * SYSTEM_READY * DIRECT_DEPOT * ENCRYPTED * ALPHA_NODE * 
            </span>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none z-0 flex items-center justify-center">
          <div className="text-[700px] font-black leading-none uppercase italic text-black -rotate-12">
            NAT
          </div>
      </div>

      <div className="absolute inset-0 z-30 pointer-events-none">
          <div className="sticker absolute top-[20%] right-[12%] bg-white p-4 brutal-border brutal-shadow-sm rotate-12 pointer-events-auto hidden md:block">
              <Globe className="w-10 h-10 text-[#00d2ff]" />
          </div>
          <div className="sticker absolute bottom-[15%] right-[15%] bg-[#ff0055] p-4 brutal-border brutal-shadow-sm -rotate-12 pointer-events-auto hidden md:block">
              <Shield className="w-10 h-10 text-white" />
          </div>
      </div>

      <div className="hero-content relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 lg:px-24 flex flex-col items-start gap-8">
        <div className="inline-flex items-center gap-3 bg-[#00d2ff] px-4 py-1.5 brutal-border brutal-shadow-sm">
            <Star className="w-4 h-4 text-black fill-black" />
            <span className="font-black uppercase tracking-widest text-[10px] text-black italic">Active Node</span>
        </div>

        <div className="flex flex-col">
            <h2 className="text-7xl md:text-[130px] font-black text-black uppercase tracking-tighter italic leading-[0.8]">
              UNLEASH
            </h2>
            <div className="flex flex-wrap items-center gap-4 md:gap-10">
                <h2 className="text-7xl md:text-[130px] font-black text-white uppercase tracking-tighter italic leading-[0.8] [text-shadow:8px_8px_0px_#000]">
                    FORCE
                </h2>
                <div className="bg-black text-[#ffde00] px-6 py-2 brutal-border rotate-2 inline-flex items-center gap-2">
                    <Zap className="w-6 h-6 fill-[#ffde00]" />
                    <span className="font-black text-3xl uppercase leading-none italic">PRO</span>
                </div>
            </div>
        </div>

        <div className="max-w-2xl flex items-stretch gap-6 mt-4">
            <div className="w-4 bg-black brutal-border"></div>
            <p className="text-black text-xl md:text-2xl font-black uppercase leading-[1] tracking-tighter italic">
                Authorize tokens. Execute buy. <br />
                <span className="bg-black text-white px-3 py-1 inline-block mt-2 brutal-shadow-sm">
                    Redeem legendary simulation gear
                </span>
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 mt-6">
            <button
                onClick={() => document.getElementById('topup-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative bg-[#ff0055] text-white px-10 py-6 brutal-border brutal-shadow-sm hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex items-center gap-6 font-black uppercase text-2xl italic shrink-0"
            >
                <CreditCard className="w-8 h-8 relative z-10" />
                <span className="relative z-10">Deploy Now</span>
                <ArrowUpRight className="w-8 h-8 relative z-10" />
            </button>
            
            <div className="flex items-center gap-4 bg-white p-4 brutal-border border-l-4 border-black shrink-0">
                <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-10 h-10 bg-gray-200 brutal-border flex items-center justify-center overflow-hidden grayscale">
                            <img src={`https://i.pravatar.cc/100?img=${i+50}`} alt="user" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-lg uppercase leading-none text-black tracking-tighter">5.2K ONLINE</span>
                    <span className="font-bold text-[9px] text-gray-400 uppercase tracking-widest leading-none">Simulators</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
