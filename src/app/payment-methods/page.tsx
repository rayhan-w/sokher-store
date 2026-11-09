import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { CreditCard, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default async function PaymentMethodsPage() {
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
          <span className="font-semibold text-gray-900">Payment Methods</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <CreditCard className="w-4 h-4" />
            <span>Secure Checkout</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Accepted Payment Methods
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Enjoy complete peace of mind with 100% Cash on Delivery and digital payment channels.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                <Banknote className="w-5 h-5 text-[#cc272d]" />
                <span>Cash on Delivery (COD)</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pay in cash directly to the delivery rider once your parcel arrives. You can inspect the package exterior and verify the items before handing over payment.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Available Nationwide Across Bangladesh</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                <CreditCard className="w-5 h-5 text-gray-800" />
                <span>Mobile Banking & Cards</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                We accept bKash, Nagad, Rocket, Visa, Mastercard, and digital wallets through verified payment gateways (SSLCOMMERZ).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-black text-[#D12053]">bKash</span>
                <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-black text-[#F7941D]">Nagad</span>
                <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-black text-[#8C3494]">Rocket</span>
                <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-black text-[#1A1F71] italic">VISA</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p>
              Zero Hidden Charges: You only pay the exact total shown on your invoice. Delivery charges are fixed at ৳70 (Inside Dhaka) and ৳130 (Outside Dhaka).
            </p>
          </div>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
