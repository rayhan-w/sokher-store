import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { DollarSign, CheckCircle2 } from 'lucide-react';

export default async function RefundPolicyPage() {
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
          <span className="font-semibold text-gray-900">Refund Policy</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            <span>Buyer Protection</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Transparent and fast refunds processed directly to your mobile banking account.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Refund Processing</h2>
            <p>
              Once a returned parcel is received at our Dhaka warehouse and inspected by our quality assurance team, your refund will be processed within 3 to 5 business days.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Refund Channels</h3>
            <p>
              For Cash on Delivery orders, refunds are sent directly via bKash or Nagad personal numbers. For digital card payments, refunds are routed back to the issuing bank card according to banking clearance cycles.
            </p>
          </section>

          <section className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Zero processing or handling deductions on approved manufacturer defects.</span>
          </section>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
