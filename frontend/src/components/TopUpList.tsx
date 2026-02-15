'use client';

import { ShoppingBag, Loader2 } from 'lucide-react';

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
  return (
    <section id="topup-section">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-6 h-6 text-indigo-400" />
        <h3 className="text-2xl font-bold text-white">Top Up Packages</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="group relative bg-neutral-800 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer"
            onClick={() => loadingId !== pkg.id && onTopUp(pkg)}
          >
            {pkg.bonus > 0 && (
              <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                +{pkg.bonus} BONUS
              </div>
            )}

            <div className="mb-4">
              <span className="text-3xl font-extrabold text-white">{pkg.points}</span>
              <span className="text-neutral-400 text-sm ml-1">Pts</span>
            </div>

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-700">
              <span className="text-neutral-300">Price</span>
              <span className="text-indigo-400 font-bold text-lg">
                Rp {pkg.price.toLocaleString('id-ID')}
              </span>
            </div>

            {loadingId === pkg.id && (
              <div className="absolute inset-0 bg-neutral-900/80 rounded-xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
