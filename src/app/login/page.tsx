'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'লগইন ব্যর্থ হয়েছে।');
        setLoading(false);
        return;
      }

      login(data.user);

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch {
      setErrorMsg('সার্ভারে সমস্যা দেখা দিয়েছে।');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-rose-100 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#cc272d] flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              <span className="text-[#cc272d]">Sokher</span> Store
            </span>
          </Link>
          <h2 className="text-xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="text-xs text-gray-500">অ্যাকাউন্টে লগইন করে অর্ডার ট্র্যাকিং ও উইশলিস্ট দেখুন</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span>{loading ? 'লগইন হচ্ছে...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          অ্যাকাউন্ট নেই?{' '}
          <Link href="/register" className="font-bold text-[#cc272d] hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
