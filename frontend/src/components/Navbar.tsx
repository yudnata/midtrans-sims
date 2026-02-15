import { Zap, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0 flex items-center gap-2">
            <Link
              href="/"
              className="group flex items-center gap-2"
            >
              <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Natstore<span className="text-indigo-500">.id</span>
              </h1>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Points Display */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-800/50 hover:bg-neutral-800 rounded-full px-2.5 sm:px-4 py-1.5 border border-neutral-700 transition-all duration-200 group cursor-default">
                  <div className="bg-yellow-500/20 p-1 sm:p-1.5 rounded-full group-hover:bg-yellow-500/30 transition-colors">
                    <Zap className="w-3.5 h-3.5 sm:w-4 h-4 text-yellow-400 fill-yellow-400/50" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-bold text-yellow-400 text-xs sm:text-sm">
                      {user.points.toLocaleString()}
                    </span>
                    <span className="hidden xs:block text-[9px] sm:text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                      Points
                    </span>
                  </div>
                </div>

                {/* User Info & Actions */}
                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-neutral-700/50">
                  <div className="flex flex-col items-end">
                    <span className="text-xs sm:text-sm font-medium text-white hidden sm:block">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 hidden lg:block">
                      {user.email}
                    </span>
                    {/* Simple Avatar for mobile */}
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold sm:hidden">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-1.5 sm:p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-all duration-200"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
