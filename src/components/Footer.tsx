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
  const address = settings.contactAddress || 'Dhaka, Bangladesh';
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
                Have questions? We are always here to help!
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Our customer support team is available from 9:00 AM to 10:00 PM every day.
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
          {/* Col 1: Store Bio & Contact */}
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
                'Your trusted destination for 100% authentic cosmetics, skincare, and beauty essentials in Bangladesh. Discover the real you.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <CheckCircle className="w-4 h-4" />
              <span>100% Authentic & Verified Online Store</span>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 pt-2 text-xs text-gray-400">
              <p className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
                <span>Hotline: {hotline}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
                <span>Email: {email}</span>
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#cc272d] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#cc272d] transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#cc272d] transition">
                  Shop Categories
                </Link>
              </li>
              <li>
                <Link href="/shop?badge=FLASH_SALE" className="hover:text-[#cc272d] transition">
                  Flash Sales & Offers
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#cc272d] transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#cc272d] transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/account" className="hover:text-[#cc272d] transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#cc272d] transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#cc272d] transition">
                  Checkout
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#cc272d] transition">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#cc272d] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#cc272d] transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Methods & Social */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Payment Methods
            </h4>
            <p className="text-xs text-gray-400">
              We accept Cash on Delivery and all popular mobile banking methods.
            </p>

            {/* Payment Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-[11px] font-bold text-pink-400">
                bKash
              </span>
              <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-[11px] font-bold text-orange-400">
                Nagad
              </span>
              <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-[11px] font-bold text-purple-400">
                Rocket
              </span>
              <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-[11px] font-bold text-emerald-400">
                Cash On Delivery
              </span>
            </div>

            <div className="pt-2">
              <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Connect With Us
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
          <p>© {currentYear} Sokher Store. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span>Authentic Beauty & Care Guaranteed</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
