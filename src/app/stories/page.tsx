import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Sparkles, HeartHandshake, Compass } from 'lucide-react';

export default async function StoriesPage() {
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
          <span className="font-semibold text-gray-900">Sokher Store Stories</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Behind the Brand</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Sokher Store Stories
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Our journey from a small passion project to Bangladesh&apos;s leading beauty destination.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#cc272d]" />
              <span>How It All Started</span>
            </h2>
            <p>
              In an online market flooded with misleading copies and unreliable beauty claims, Sokher Store was founded with a singular conviction: every Bangladeshi beauty lover deserves access to authentic, safe, and world-class skincare and makeup without paying inflated prices or questioning authenticity.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#cc272d]" />
              <span>Our Community & Growth</span>
            </h2>
            <p>
              From our first batch of 50 skincare serums delivered by hand in Dhaka to serving thousands of satisfied customers every month across Sylhet, Chittagong, Rajshahi, Khulna, and beyond, our growth has always been powered by word-of-mouth recommendations and customer trust.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
            <h3 className="font-bold text-[#cc272d] text-sm">Empowering Everyday Confidence</h3>
            <p className="text-xs text-gray-600">
              We continue to expand our collection with dermatologist-tested formulas, Korean skincare cult favorites, and everyday essentials so you can express your true beauty effortlessly.
            </p>
          </div>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
