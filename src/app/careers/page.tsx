import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Briefcase, Send } from 'lucide-react';

export default async function CareersPage() {
  const [settings, categories] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { subcategories: true },
    }),
  ]);

  const defaultSettings: any = settings || {
    storeName: 'Sokher Store',
    contactEmail: 'support@sokherstore.com',
  };

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={categories as any} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d]">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-gray-900">Careers</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            <span>Join Our Team</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Careers at Sokher Store
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Build the future of beauty commerce in Bangladesh with a talented, passionate team.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Why Work With Us?</h2>
            <p>
              At Sokher Store, we foster a collaborative, dynamic workplace where creative marketing, technology, logistics, and customer service come together to delight beauty lovers nationwide.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Current Openings</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-gray-900">Customer Support & Live Chat Specialist</h4>
                  <p className="text-xs text-gray-500">Full Time • Mirpur, Dhaka (Onsite/Hybrid)</p>
                </div>
                <a
                  href={`mailto:${defaultSettings.contactEmail || 'careers@sokherstore.com'}?subject=Application:%20Customer%20Support`}
                  className="px-4 py-2 bg-[#cc272d] text-white font-bold rounded-lg text-xs self-start sm:self-auto hover:bg-red-700 transition"
                >
                  Apply Now
                </a>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-gray-900">E-Commerce Warehouse & Dispatch Executive</h4>
                  <p className="text-xs text-gray-500">Full Time • Mirpur, Dhaka</p>
                </div>
                <a
                  href={`mailto:${defaultSettings.contactEmail || 'careers@sokherstore.com'}?subject=Application:%20Warehouse%20Executive`}
                  className="px-4 py-2 bg-[#cc272d] text-white font-bold rounded-lg text-xs self-start sm:self-auto hover:bg-red-700 transition"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </section>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-red-100 text-xs text-gray-700 flex items-center gap-3">
            <Send className="w-5 h-5 text-[#cc272d] flex-shrink-0" />
            <p>
              Don&apos;t see an exact match? Send your CV to{' '}
              <strong className="text-[#cc272d]">{defaultSettings.contactEmail || 'careers@sokherstore.com'}</strong>{' '}
              and tell us how you can make a difference!
            </p>
          </div>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
