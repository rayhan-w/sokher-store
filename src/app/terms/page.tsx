import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { FileText } from 'lucide-react';

export default async function TermsPage() {
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
          <span className="font-semibold text-gray-900">Terms & Conditions</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>Legal Agreement</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Please review the legal terms governing your use of Sokher Store and placing online orders.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing Sokher Store or placing an order, you agree to comply with and be bound by these Terms and Conditions and our Privacy Policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">2. Product Pricing & Stock</h2>
            <p>
              All prices listed on our website are in Bangladeshi Taka (৳) and include applicable taxes unless specified otherwise. We make every effort to display accurate stock quantities and pricing. If a pricing error occurs, we reserve the right to contact you before fulfilling the order.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">3. Orders & Cash on Delivery</h2>
            <p>
              When placing an order via Cash on Delivery, customers are required to provide an authentic phone number and accurate shipping address. Our verification team may contact you via phone or SMS prior to package dispatch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">4. Intellectual Property</h2>
            <p>
              All store graphics, logos, brand typography, and proprietary product photographs are intellectual property of Sokher Store or used with authorization from respective brand partners.
            </p>
          </section>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
