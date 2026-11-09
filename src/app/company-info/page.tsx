import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Building2, ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';

export default async function CompanyInfoPage() {
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
    contactPhone: '+880 1700-000000',
  };

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={categories as any} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d]">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-gray-900">Company Information</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Corporate Profile</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Company Information
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Learn more about Sokher Store, our operational footprint, and core business values.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">About Sokher Store BD</h2>
            <p>
              Sokher Store is an e-commerce platform registered in Bangladesh, headquartered in Mirpur, Dhaka. We specialize in curating, sourcing, and retailing premium cosmetics, skincare, and fragrance collections from world-renowned beauty brands.
            </p>
            <p>
              Our operations combine automated warehouse fulfillment in Dhaka with express courier partnerships to ensure delivery across all 64 districts of Bangladesh.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="p-4 rounded-xl bg-gray-50 space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Head Office</span>
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#cc272d]" />
                <span>Mirpur, Dhaka, Bangladesh</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Hotline Support</span>
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#cc272d]" />
                <span>{defaultSettings.contactPhone || '+880 1700-000000'}</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Corporate Email</span>
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#cc272d]" />
                <span>{defaultSettings.contactEmail || 'support@sokherstore.com'}</span>
              </p>
            </div>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Trade & Licensing Compliance</h3>
            <p>
              Sokher Store conducts business in full compliance with the Consumer Rights Protection Act of Bangladesh, maintaining transparent product sourcing, verified manufacturer batch numbers, and fair consumer protection mechanisms.
            </p>
          </section>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
