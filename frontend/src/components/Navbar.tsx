'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { Menu, X, LogOut, User, Wallet, ShoppingBag, LayoutDashboard, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, logout, refreshUser, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Use set to ensure final state is correct if animation fails
      gsap.from(navRef.current, {
        y: -60, // Reduced distance
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'all', // CRITICAL: Reset styles after animation
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      style={{ opacity: 1 }} // Ensure visible by default if JS/GSAP lags
      className="sticky top-0 z-50 bg-black py-4 brutal-border-b border-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group"
          >
            <div className="bg-[#ffde00] p-2 brutal-border group-hover:rotate-6 transition-transform">
              <ShoppingBag className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
              NATSTORE<span className="text-[#ffde00]">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <div className="bg-[#222] px-4 py-2 brutal-border-white flex items-center space-x-3 hover:bg-neutral-800 transition-colors cursor-default">
                  <div className="bg-[#ffde00] p-1 brutal-border-sm">
                    <Zap className={`w-4 h-4 text-black ${loading ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-white text-sm">
                      {user.points?.toLocaleString()} PTS
                    </span>
                  </div>
                  <button
                    onClick={refreshUser}
                    className="ml-2 p-1 bg-white text-black hover:bg-[#ffde00] transition-colors brutal-border-sm"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center space-x-4 ml-6">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-1 px-4 py-2 bg-[#ffde00] brutal-border text-black hover:bg-white transition-all font-black uppercase text-xs"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>DASHBOARD</span>
                  </Link>

                  <div className="flex items-center space-x-4 border-l-2 border-neutral-800 pl-6">
                    <div className="flex items-center space-x-3 bg-white px-3 py-1 brutal-border hover:translate-x-1 transition-transform">
                      <User className="w-4 h-4 text-black" />
                      <span className="font-black text-black uppercase text-xs">{user.name}</span>
                    </div>

                    <button
                      onClick={logout}
                      className="bg-[#ff0055] text-white p-2 brutal-border hover:bg-white hover:text-[#ff0055] transition-colors group"
                    >
                      <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-8">
                <Link
                  href="/login"
                  className="font-black uppercase text-sm text-white hover:text-[#ffde00] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#ffde00] text-black px-8 py-3 brutal-border brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase font-black text-sm"
                >
                  Register Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 brutal-border bg-[#ffde00] text-black"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-black border-t-2 border-neutral-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-6 pb-10 space-y-6">
            {user ? (
              <>
                <div className="bg-[#222] p-6 brutal-border-white">
                  <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-2">
                    <span className="text-[10px] uppercase font-black text-neutral-500">
                      Secure Node
                    </span>
                    <span className="text-[10px] font-black bg-[#ffde00] px-2 py-0.5 brutal-border text-black uppercase">
                      Online
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white brutal-border flex items-center justify-center">
                      <User className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <p className="font-black uppercase text-lg leading-tight text-white">
                        {user.name}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 brutal-border flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-black">
                    <Wallet className="w-6 h-6 text-[#ff0055]" />
                    <span className="font-black uppercase text-xs tracking-tighter">
                      Credits Depot
                    </span>
                  </div>
                  <span className="text-2xl font-black text-black tracking-tighter">
                    {user.points?.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center space-x-2 p-4 bg-[#ffde00] brutal-border font-black uppercase text-xs text-black"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>DASH</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center justify-center space-x-2 p-4 bg-[#ff0055] text-white brutal-border font-black uppercase text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>LOGOUT</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-4">
                <Link
                  href="/login"
                  className="w-full py-5 text-center font-black uppercase brutal-border bg-white text-black"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="w-full py-5 text-center font-black uppercase brutal-border bg-[#ffde00] text-black"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
