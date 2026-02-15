'use client';

import { Gift } from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-6 h-6 text-pink-400" />
        <h3 className="text-2xl font-bold text-white">Redeem Rewards</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => {
          const canAfford = userPoints >= item.cost;

          return (
            <div
              key={item.id}
              className="bg-neutral-800/50 rounded-xl overflow-hidden transition-all group hover:scale-105"
            >
              <div className="relative w-full aspect-video bg-neutral-800 flex items-center justify-center overflow-hidden transition-transform duration-300">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-1 rounded',
                      item.type === 'Legend'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : item.type === 'Mythic'
                          ? 'bg-red-500/20 text-red-500'
                          : item.type === 'Epic'
                            ? 'bg-purple-500/20 text-purple-500'
                            : 'bg-blue-500/20 text-blue-500',
                    )}
                  >
                    {item.type}
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-4 truncate text-white">{item.name}</h4>

                <button
                  onClick={() => onRedeem(item)}
                  disabled={!canAfford}
                  className={cn(
                    'w-full py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2',
                    canAfford
                      ? 'bg-pink-600 hover:bg-pink-700 text-white'
                      : 'bg-neutral-700 text-neutral-500 cursor-not-allowed',
                  )}
                >
                  {canAfford ? <>Redeem for {item.cost} Pts</> : <>Need {item.cost} Pts</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
