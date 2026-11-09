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
} from 'lucide-react';

interface CategoryLink {
  id: string;
  name: string;
  slug: string;
}

interface FooterProps {
  settings: {
    storeName?: string;
    tagline?: string | null;
    logoUrl?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    contactAddress?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    playStoreUrl?: string | null;
    appStoreUrl?: string | null;
  };
  categories?: CategoryLink[];
}

export default function Footer({ settings, categories = [] }: FooterProps) {
  const currentYear = 2026;
  const hotline = settings.contactPhone || '+880 1700-000000';
  const email = settings.contactEmail || 'support@sokherstore.com';
  const address = settings.contactAddress || 'Mirpur, Dhaka, Bangladesh';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');

  const featuredCats = categories.slice(0, 7);

  return (
    <footer className="bg-[#111827] text-gray-300 pt-12 pb-8 border-t border-gray-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5-Column Reference Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 pb-12 border-b border-gray-800/80">
          {/* Col 1: Brand Info & Contact */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#cc272d] flex items-center justify-center shadow-md">
                <Image
                  src={settings.logoUrl || '/images/logo-icon.jpg'}
                  alt={settings.storeName || 'Sokher Store'}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-sans">
                <span className="text-[#cc272d]">SOKHER</span> STORE
              </span>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed">
              {settings.tagline ||
                '100% authentic cosmetics, skincare, and beauty essentials in Bangladesh.'}
            </p>

            {/* Address, Phone, Email */}
            <div className="space-y-2 pt-1 text-xs text-gray-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#cc272d] flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-white transition">
                  {hotline}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition truncate">
                  {email}
                </a>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={settings.facebookUrl || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-[#cc272d] text-gray-400 hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-[#cc272d] text-gray-400 hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.youtubeUrl || 'https://youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-[#cc272d] text-gray-400 hover:text-white transition"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            {/* Download App on Mobile: Hidden if no URL set */}
            {(settings.playStoreUrl || settings.appStoreUrl) && (
              <div className="pt-2">
                <p className="text-[11px] font-bold text-gray-400 mb-2">Download App on Mobile:</p>
                <div className="flex items-center gap-2">
                  {settings.playStoreUrl && (
                    <a
                      href={settings.playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Get it on Google Play"
                        width={110}
                        height={33}
                      />
                    </a>
                  )}
                  {settings.appStoreUrl && (
                    <a
                      href={settings.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                        alt="Download on the App Store"
                        width={110}
                        height={33}
                      />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Col 2: Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Information
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/company-info" className="hover:text-white transition">
                  Company Information
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-white transition">
                  Sokher Store Stories
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Shop By */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Shop By
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {featuredCats.length > 0 ? (
                featuredCats.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/category/${cat.slug}`} className="hover:text-white transition">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/shop" className="hover:text-white transition">
                      Skincare
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop" className="hover:text-white transition">
                      Makeup & Cosmetics
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop" className="hover:text-white transition">
                      Hair Care
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop" className="hover:text-white transition">
                      Fragrances
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 4: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/support" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/how-to-order" className="hover:text-white transition">
                  How to Order
                </Link>
              </li>
              <li>
                <Link href="/payment-methods" className="hover:text-white transition">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition">
                  Order Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Consumer Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Consumer Policy
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/returns" className="hover:text-white transition">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/exchange-policy" className="hover:text-white transition">
                  Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="hover:text-white transition">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/pre-order" className="hover:text-white transition">
                  Pre-Order Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright on Left, Real Payment Badges on Right */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} Sokher Store. All Rights Reserved.</p>

          {/* Real Payment Provider Logos */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* bKash */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center shadow-xs">
              <span className="text-[11px] font-black text-[#D12053]">bKash</span>
            </div>
            {/* Nagad */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center shadow-xs">
              <span className="text-[11px] font-black text-[#F7941D]">Nagad</span>
            </div>
            {/* Rocket */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center shadow-xs">
              <span className="text-[11px] font-black text-[#8C3494]">Rocket</span>
            </div>
            {/* Visa */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center shadow-xs">
              <span className="text-[11px] font-black text-[#1A1F71] italic">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center shadow-xs">
              <div className="flex items-center -space-x-1">
                <span className="w-3 h-3 rounded-full bg-[#EB001B] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#F79E1B] inline-block opacity-90" />
              </div>
            </div>
            {/* SSLCommerz */}
            <div className="h-6 px-2 bg-white rounded flex items-center justify-center shadow-xs">
              <span className="text-[10px] font-black text-gray-800">SSLCOMMERZ</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
