import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Headphones, Phone, Mail, MessageCircle, Clock, MapPin } from 'lucide-react';

export default async function SupportPage() {
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
  const hotline = defaultSettings.contactPhone || '+880 1700-000000';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');
  const cleanWa = cleanPhone.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={categories as any} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d]">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-gray-900">Help Center</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Headphones className="w-4 h-4" />
            <span>24/7 Dedicated Care</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Customer Help Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Have questions about your order, tracking, or skincare advice? We are always here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <a
            href={`tel:${cleanPhone}`}
            className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-[#cc272d] hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-[#cc272d] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Call Hotline</h3>
            <p className="text-xs text-gray-500">{hotline}</p>
            <span className="inline-block text-[11px] font-bold text-[#cc272d] pt-1">Call Now →</span>
          </a>

          <a
            href={`https://wa.me/${cleanWa}?text=Hello%20Sokher%20Store%2C%20I%20need%20assistance`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-emerald-500 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">WhatsApp Chat</h3>
            <p className="text-xs text-gray-500">Fast response via WhatsApp</p>
            <span className="inline-block text-[11px] font-bold text-emerald-600 pt-1">Chat Now →</span>
          </a>

          <a
            href={`mailto:${defaultSettings.contactEmail || 'support@sokherstore.com'}`}
            className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-400 hover:shadow-md transition text-center space-y-2 group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 text-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Email Support</h3>
            <p className="text-xs text-gray-500 truncate">{defaultSettings.contactEmail || 'support@sokherstore.com'}</p>
            <span className="inline-block text-[11px] font-bold text-gray-700 pt-1">Send Email →</span>
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-4 text-xs sm:text-sm text-gray-700">
          <h2 className="text-base font-bold text-gray-900">Service Hours & Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
              <span>Daily from 9:00 AM to 10:00 PM (Bangladesh Time)</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
              <span>Mirpur, Dhaka - 1216, Bangladesh</span>
            </p>
          </div>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
