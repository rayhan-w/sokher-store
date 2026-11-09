import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Truck, Clock, MapPin, ShieldCheck } from 'lucide-react';

export default async function ShippingPolicyPage() {
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
          <span className="font-semibold text-gray-900">Shipping & Delivery</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Truck className="w-4 h-4" />
            <span>Fast Express Dispatch</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Reliable, tracked, and protective shipping directly to your doorstep.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                <MapPin className="w-5 h-5 text-[#cc272d]" />
                <span>Inside Dhaka Metro</span>
              </div>
              <p className="text-2xl font-black text-[#cc272d]">৳70</p>
              <p className="text-xs text-gray-500">
                Standard delivery within 24 to 48 hours directly to your address.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                <Truck className="w-5 h-5 text-gray-800" />
                <span>Outside Dhaka (All Districts)</span>
              </div>
              <p className="text-2xl font-black text-gray-900">৳130</p>
              <p className="text-xs text-gray-500">
                Delivered in 2 to 4 business days via express courier network.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-rose-50/70 border border-red-100 space-y-1.5">
            <h3 className="font-bold text-[#cc272d] text-sm">Free Shipping Threshold</h3>
            <p className="text-xs text-gray-600">
              Orders with a subtotal of ৳999 or more automatically receive FREE delivery anywhere in Bangladesh!
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-gray-900">Packaging & Handling</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Cosmetic items, serums, and fragrances are fragile. We package all goods in thick multi-layer bubble wrap, moisture-proof cartons, and safety-taped seals to prevent any leakages or transit damages.
            </p>
          </div>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
