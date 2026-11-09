import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export default async function ReturnsPage() {
  const [settings, categories] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { subcategories: true },
    }),
  ]);

  const defaultSettings: any = settings || {
    storeName: 'Sokher Store',
    contactPhone: '+880 1700-000000',
  };

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={categories as any} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d]">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-gray-900">Return Policy</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <RotateCcw className="w-4 h-4" />
            <span>Customer First</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Return Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            7-day return guarantee for damaged, defective, or incorrect items.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">7-Day Hassle-Free Returns</h2>
            <p>
              Your satisfaction is our priority. If you receive a product that is damaged during transit, defective, or different from what you ordered, you can initiate a return within 7 days of receiving the package.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Eligibility Criteria</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>The item must be in its original packaging with manufacturer seal intact.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>The product must be unused and unswatched for hygiene reasons.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>You must have the delivery invoice or order number received via SMS.</span>
              </li>
            </ul>
          </section>

          <section className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
            <h4 className="font-bold text-gray-900">How to request a return:</h4>
            <p>
              Contact our support team on WhatsApp or phone at{' '}
              <strong className="text-gray-900">{defaultSettings.contactPhone || '+880 1700-000000'}</strong> with your order number and photos of the defective item. Our team will arrange a free exchange or return pickup.
            </p>
          </section>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
