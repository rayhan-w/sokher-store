'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle,
} from 'lucide-react';

interface FooterProps {
  settings: {
    storeName?: string;
    tagline?: string | null;
    logoUrl?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    contactAddress?: string | null;
    whatsappNumber?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    deliveryDhaka?: number;
    deliveryOutsideDhaka?: number;
    freeDeliveryThreshold?: number;
  };
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const hotline = settings.contactPhone || '+880 1700-000000';
  const email = settings.contactEmail || 'support@sokherstore.com';
  const address = settings.contactAddress || 'ঢাকা, বাংলাদেশ';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');

  return (
    <footer className="bg-gray-950 text-gray-300 pt-14 pb-10 border-t border-gray-900 mt-16 select-none">
      {/* Top Help Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 mb-10 border-b border-gray-800">
        <div className="bg-gray-900/90 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-800">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-[#cc272d] text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/30">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                যেকোনো প্রয়োজনে আমাদের কল করুন
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                সকাল ৯টা থেকে রাত ১০টা পর্যন্ত আমাদের কাস্টমার কেয়ার টিম আপনার সেবায় নিয়োজিত।
              </p>
            </div>
          </div>
          <a
            href={`tel:${cleanPhone}`}
            className="px-6 py-3 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-lg transition active:scale-95 flex-shrink-0"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            <span>{hotline}</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Store Bio & Contact (Ghorer Bazar Style) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#e11d2e] flex items-center justify-center shadow-md">
                <Image
                  src={settings.logoUrl || '/images/logo-icon.jpg'}
                  alt={settings.storeName || 'Sokher Store'}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-sans">
                <span className="text-[#cc272d]">Sokher</span> Store
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              {settings.tagline ||
                'বাংলাদেশের অন্যতম বিশ্বস্ত প্রিমিয়াম কসমেটিক্স ও স্কিনকেয়ার শপ। ১০০% অরিজিনাল ও অথেন্টিক বিউটি প্রোডাক্টস নিয়ে আমরা আছি আপনার পাশে।'}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <CheckCircle className="w-4 h-4" />
              <span>১০০% খাঁটি ও বিশ্বস্ত অনলাইন শপ</span>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 pt-2 text-xs text-gray-400">
              <p className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
                <span>হটলাইন: {hotline}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
                <span>ইমেইল: {email}</span>
              </p>
            </div>
          </div>

          {/* Col 2: গুরুত্বপূর্ণ লিংক (Quick Links) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              গুরুত্বপূর্ণ লিংক
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#cc272d] transition">
                  হোম পেজ
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#cc272d] transition">
                  সকল পণ্য
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#cc272d] transition">
                  ক্যাটাগরি সমূহ
                </Link>
              </li>
              <li>
                <Link href="/shop?badge=FLASH_SALE" className="hover:text-[#cc272d] transition">
                  অফার জোন / ছাড়
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#cc272d] transition">
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#cc272d] transition">
                  যোগাযোগ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: কাস্টমার সাপোর্ট ও পলিসি */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              কাস্টমার কেয়ার
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/account" className="hover:text-[#cc272d] transition">
                  অর্ডার ট্র্যাক করুন
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#cc272d] transition">
                  শপিং কার্ট
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#cc272d] transition">
                  চেকআউট
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#cc272d] transition">
                  রিটার্ন ও রিফান্ড পলিসি
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#cc272d] transition">
                  প্রাইভেসি পলিসি
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#cc272d] transition">
                  টার্মস অ্যান্ড কন্ডিশনস
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: পেমেন্ট মেথড ও সোশ্যাল মিডিয়া */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              পেমেন্ট মাধ্যম
            </h4>
            <p className="text-xs text-gray-400">
              আমরা ক্যাশ অন ডেলিভারি এবং দেশের সকল জনপ্রিয় অনলাইন পেমেন্ট গ্রহণ করি।
            </p>

            {/* Payment Badges (Ghorer Bazar Style) */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-[11px] font-bold text-pink-400">
                bKash (বিকাশ)
              </span>
              <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-[11px] font-bold text-orange-400">
                Nagad (নগদ)
              </span>
              <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-[11px] font-bold text-purple-400">
                Rocket (রকেট)
              </span>
              <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-[11px] font-bold text-emerald-400">
                Cash On Delivery
              </span>
            </div>

            <div className="pt-2">
              <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                সোশ্যাল মিডিয়ায় যুক্ত থাকুন
              </h5>
              <div className="flex items-center gap-3">
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-[#cc272d] text-gray-400 hover:text-white transition"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-[#cc272d] text-gray-400 hover:text-white transition"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.youtubeUrl && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-[#cc272d] text-gray-400 hover:text-white transition"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-gray-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} Sokher Store — শখের স্টোর। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span>বিশ্বস্ত ও দ্রুত অনলাইন শপিং</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
