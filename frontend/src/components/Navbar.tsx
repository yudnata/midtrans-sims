import { Zap } from 'lucide-react';

interface NavbarProps {
  userPoints: number;
}

export default function Navbar({ userPoints }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Natstore<span className="text-indigo-500">.id</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-neutral-800 rounded-full px-4 py-1.5 border border-neutral-700">
          <div className="bg-yellow-500/20 p-1.5 rounded-full">
            <Zap className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
          <span className="font-bold text-yellow-400 text-lg">{userPoints}</span>
          <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
            Points
          </span>
        </div>
      </div>
    </header>
  );
}
