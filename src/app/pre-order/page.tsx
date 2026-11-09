import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Clock, Sparkles, ShieldCheck } from 'lucide-react';

export default async function PreOrderPage() {
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
          <span className="font-semibold text-gray-900">Pre-Order Policy</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Exclusive Reservations</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Pre-Order Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Reserve upcoming international beauty launches and limited-edition cosmetics ahead of time.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">How Pre-Orders Work</h2>
            <p>
              Pre-order items allow you to secure popular trending beauty products before our international shipments arrive in Bangladesh. Expected arrival timelines (usually 7 to 14 business days) are stated clearly on the product page.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Payment & Delivery for Pre-Orders</h3>
            <p>
              Pre-orders can be placed with Cash on Delivery or partial booking confirmation via bKash. As soon as the shipment clears customs in Dhaka, your package will be dispatched with priority 24-hour express courier.
            </p>
          </section>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-red-100 text-xs text-gray-700 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#cc272d] flex-shrink-0" />
            <p>
              Pre-order guarantees authentic fresh batches straight from brand factories in USA, UK, Canada, and South Korea.
            </p>
          </div>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
