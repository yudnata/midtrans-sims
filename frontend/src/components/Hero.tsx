'use client';

import { CreditCard, Trophy } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-indigo-900 to-purple-900 p-8 md:p-12">
      <div className="absolute top-0 right-0 p-12 opacity-10">
        <Trophy className="w-64 h-64 text-white" />
      </div>
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-4xl font-extrabold mb-4 leading-tight text-white">
          Level Up Your Experience
        </h2>
        <p className="text-indigo-200 text-lg mb-8">
          Top up points to unlock exclusive skins, avatars, and premium passes instantly.
        </p>
        <button
          onClick={() =>
            document.getElementById('topup-section')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          Get Points Now
        </button>
      </div>
    </div>
  );
}
