import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Shield } from 'lucide-react';

export default async function PrivacyPage() {
  const [settings, categories] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { subcategories: true },
    }),
  ]);

  const defaultSettings = settings || { storeName: 'Sokher Store' };

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={categories as any} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d]">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-gray-900">Privacy Policy</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Data Protection</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            How we protect, process, and secure your personal details and order information.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">1. Information We Collect</h2>
            <p>
              When you purchase from Sokher Store or register an account, we collect necessary shipping data including your full name, phone number, delivery address, and optional email address to dispatch and track your parcel.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">2. How We Use Your Data</h2>
            <p>
              Your personal details are used strictly to fulfill your order, communicate parcel tracking updates via SMS or phone call, and assist with post-delivery customer support. We never sell, rent, or lease your private data to third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">3. Secure Payments & Cookies</h2>
            <p>
              Our website uses SSL encryption for all data transmissions. Cart contents and session data are stored locally in secure browser storage for your convenience during checkout.
            </p>
          </section>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
