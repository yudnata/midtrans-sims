'use client';

import React, { useEffect, useRef } from 'react';
import { Gift, Lock, Package, Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface RewardItem {
  id: string;
  name: string;
  cost: number;
  image: string;
  type: string;
}

interface RedeemListProps {
  items: RewardItem[];
  userPoints: number;
  onRedeem: (item: RewardItem) => void;
}

export default function RedeemList({ items, userPoints, onRedeem }: RedeemListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = listRef.current?.querySelectorAll('.redeem-card');
      if (cards && cards.length > 0) {
        // Force initial state to prevent flash
        gsap.set(cards, { opacity: 0, scale: 0.9, y: 30 });

        gsap.to(cards, {
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top bottom-=50', // Trigger as soon as it enters viewport
            toggleActions: 'play none none none',
          },
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'back.out(1.2)',
          force3D: true, // GPU Acceleration
          clearProps: 'transform,opacity', // Precision cleaning
          onComplete: () => {
              // Ensure no lingering GSAP styles interfere with hover
              gsap.set(cards, { clearProps: 'all' });
          }
        });
      }
    }, listRef);
    return () => ctx.revert();
  }, [items]); // Re-run if items change

  return (
    <section className="py-8" ref={listRef}>
      {/* LOOT HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b-4 border-black pb-4">
        <div className="flex items-center gap-6">
            <div className="bg-[#00d2ff] p-5 brutal-border rotate-[3deg]">
                <ShoppingCart className="w-10 h-10 text-white" />
            </div>
            <div>
                <h3 className="text-5xl font-black uppercase tracking-tighter italic leading-none text-black">
                    LOOT_VAULT
                </h3>
                <p className="font-black text-[10px] uppercase text-gray-500 tracking-[0.3em] mt-2 italic">
                    Asset Deployment Registry V.02
                </p>
            </div>
        </div>
        <div className="bg-black text-white px-8 py-4 brutal-border flex items-center gap-4">
            <span className="font-black text-4xl leading-none italic">{userPoints.toLocaleString()}</span>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Available</span>
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none text-[#00d2ff]">Credits</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {items.map((item) => {
          const canAfford = userPoints >= item.cost;

          return (
            <div
              key={item.id}
              className="redeem-card group relative bg-white brutal-border brutal-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex flex-col will-change-transform"
            >
              <div className="relative w-full aspect-[4/5] bg-neutral-200 brutal-border-b border-black overflow-hidden pointer-events-none">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  priority={item.id === 'r1' || item.id === 'r2'}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                />
                
                <div className="absolute top-4 left-4 z-10 rotate-[-5deg] group-hover:rotate-0 transition-transform">
                   <div className={cn(
                      'px-4 py-2 brutal-border font-black uppercase text-[10px] tracking-widest shadow-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
                      item.type === 'Legend' ? 'bg-[#ffde00] text-black'
                      : item.type === 'Mythic' ? 'bg-[#ff0055] text-white'
                      : 'bg-black text-white'
                    )}>
                        {item.type}
                    </div>
                </div>
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <h4 className="font-black text-2xl mb-8 uppercase tracking-tighter italic line-clamp-2 leading-[0.9] border-l-4 border-black pl-4 group-hover:translate-x-2 transition-transform">
                  {item.name}
                </h4>

                <div className="mt-auto">
                    <button
                        onClick={() => onRedeem(item)}
                        disabled={!canAfford}
                        className={cn(
                        'w-full py-5 brutal-border border-black font-black uppercase text-sm transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn',
                        canAfford
                            ? 'bg-black text-white hover:bg-[#ff0055]'
                            : 'bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed shadow-none',
                        )}
                    >
                        {canAfford ? (
                            <>
                                <Package className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                <span className="tracking-widest">DEPLOY: {item.cost} PTS</span>
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                <span>NEED {item.cost} PTS</span>
                            </>
                        )}
                    </button>
                    {!canAfford && (
                        <div className="mt-4 text-center">
                            <span className="text-[10px] font-black uppercase text-[#ff0055] tracking-[0.2em] animate-pulse">Insufficient Node Credits</span>
                        </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
