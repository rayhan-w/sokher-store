import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={{ storeName: 'Sokher Store' }} categories={[]} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest">
            About Sokher Store
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            Your Beauty, Our Passion
          </h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Sokher Store is your trusted premium online destination for cosmetics, skincare, and beauty care in Bangladesh.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-bold text-gray-900">Our Promise & Mission</h2>
          <p>
            We believe natural beauty is invaluable. Our mission is to boost your confidence with 100% authentic, high-quality skincare and cosmetic products. Every item sold at Sokher Store is sourced directly from official distributors and verified global brands.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#cc272d]" />
              <h3 className="font-bold text-gray-900">100% Authentic</h3>
              <p className="text-[11px] text-gray-500">Zero counterfeit or expired goods. Guaranteed original cosmetics.</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <Sparkles className="w-6 h-6 text-[#cc272d]" />
              <h3 className="font-bold text-gray-900">Fast Express Delivery</h3>
              <p className="text-[11px] text-gray-500">24-48 hours inside Dhaka and 2-4 days across Bangladesh.</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <Heart className="w-6 h-6 text-[#cc272d]" />
              <h3 className="font-bold text-gray-900">Dedicated Support</h3>
              <p className="text-[11px] text-gray-500">Our customer support helpline and live chat are ready to assist you anytime.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={{ storeName: 'Sokher Store' }} />
    </div>
  );
}
