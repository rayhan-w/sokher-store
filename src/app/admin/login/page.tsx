'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@sokherstore.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
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
        setErrorMsg(data.error || 'ভুল ইমেইল বা পাসওয়ার্ড।');
        setLoading(false);
        return;
      }

      if (data.user.role !== 'ADMIN') {
        setErrorMsg('অননুমোদিত এক্সেস! শুধুমাত্র অ্যাডমিন লগইন করতে পারবেন।');
        setLoading(false);
        return;
      }

      login(data.user);
      router.push('/admin');
    } catch {
      setErrorMsg('সার্ভারে সমস্যা হয়েছে।');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6 text-gray-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#cc272d] text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Sokher Store Admin</h1>
          <p className="text-xs text-gray-400">মাস্টার অ্যাডমিন কন্ট্রোল প্যানেল</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700/60 text-[11px] text-gray-400">
            <p className="font-semibold text-gray-300">Default Demo Credentials:</p>
            <p>Email: <span className="text-rose-400 font-mono">admin@sokherstore.com</span></p>
            <p>Password: <span className="text-rose-400 font-mono">admin123456</span></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span>{loading ? 'যাচাই করা হচ্ছে...' : 'Enter Admin Panel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-800">
          <Link href="/" className="hover:text-white transition">
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
