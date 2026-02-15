'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Need to import axios directly here to handle the login request manually first
  // or add a login function to AuthContext that calls the API.
  // Let's use fetch for simplicity to hit our API.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      // Use axios with withCredentials: true to ensure the HttpOnly cookie is saved
      const res = await axios.post(
        `${apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      // Backend sets HttpOnly cookie. We just update context state.
      login('dummy-token', res.data.user);
      toast.success('Welcome back!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Login failed');
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="max-w-md w-full bg-neutral-900 rounded-2xl px-12 py-12 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
        <p className="text-neutral-400 text-center mb-8">Login to manage your points and rewards</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-neutral-800  rounded-lg px-4 py-3 text-white focus:outline-hidden focus:border-indigo-500 transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-hidden focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Create Account
          </Link>
        </p>
      </div>
    </main>
  );
}
