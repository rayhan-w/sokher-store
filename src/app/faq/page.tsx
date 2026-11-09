import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { HelpCircle } from 'lucide-react';

export default async function FaqPage() {
  const [settings, categories] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { subcategories: true },
    }),
  ]);

  const defaultSettings: any = settings || {
    storeName: 'Sokher Store',
    contactPhone: '+880 1700-000000',
  };

  const faqs = [
    {
      q: 'Are all your products 100% original and authentic?',
      a: 'Yes, absolutely. We source all cosmetics and skincare products directly from authorized brand distributors and verified international manufacturers. Every item has an authentic batch code and seal.',
    },
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'We offer Cash on Delivery nationwide across Bangladesh. You can inspect the outer packaging and verify your order with the delivery officer before paying in cash.',
    },
    {
      q: 'What are your delivery charges and delivery times?',
      a: 'Delivery inside Dhaka is ৳70 (typically takes 24-48 hours). Delivery outside Dhaka is ৳130 (typically takes 2-4 business days). Orders over ৳999 qualify for Free Shipping.',
    },
    {
      q: 'How can I track my order status?',
      a: 'You can click "Track Order" in the top header or visit your Account dashboard. Once your order is dispatched, you will receive an SMS and Tracking ID.',
    },
    {
      q: 'What is your return policy?',
      a: 'If you receive a defective, damaged, or incorrect item, you can request an exchange or refund within 7 days of delivery, provided the item is intact and unused.',
    },
    {
      q: 'How can I contact customer support?',
      a: `You can call our hotline at ${defaultSettings.contactPhone || '+880 1700-000000'} or send a WhatsApp message anytime. Our support team operates daily from 9:00 AM to 10:00 PM.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={categories as any} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d]">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-gray-900">Frequently Asked Questions</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Find answers to common questions about orders, payments, authentic products, and delivery.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs divide-y divide-gray-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-5 first:pt-0 last:pb-0 space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
