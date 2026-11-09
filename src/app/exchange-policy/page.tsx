import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default async function ExchangePolicyPage() {
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
          <span className="font-semibold text-gray-900">Exchange Policy</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            <span>Product Exchange</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Exchange Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Easily swap shades, sizes, or items with our prompt exchange service.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Exchange Rules</h2>
            <p>
              Ordered the wrong shade of foundation or lipstick? As long as the product is untouched, unopened, and in sealed original packaging, you can request an exchange within 5 days of delivery.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Price Adjustments</h3>
            <p>
              If the replacement product has a higher price, you can pay the difference via COD or bKash. If the replacement has a lower price, the remaining balance will be refunded to you or credited to your store balance.
            </p>
          </section>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
