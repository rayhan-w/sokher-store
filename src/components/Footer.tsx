'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

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
    deliveryDhakaSuburbs?: number;
    deliveryOutsideDhaka?: number;
    freeDeliveryThreshold?: number;
  };
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-12 border-t border-gray-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#e11d2e] flex items-center justify-center">
                <Image
                  src={settings.logoUrl || '/images/logo-icon.jpg'}
                  alt={settings.storeName || 'Sokher Store'}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                <span className="text-[#cc272d]">Sokher</span> Store
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              {settings.tagline ||
                'Your trusted destination for 100% authentic cosmetics, skincare, and beauty essentials in Bangladesh. Discover the real you.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-[#cc272d] text-gray-400 hover:text-white transition"
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
                  className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-[#cc272d] text-gray-400 hover:text-white transition"
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
                  className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-[#cc272d] text-gray-400 hover:text-white transition"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Quick Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#cc272d] transition">Home</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#cc272d] transition">All Products</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#cc272d] transition">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#cc272d] transition">Contact Us</Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#cc272d] transition">My Account</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Delivery Rates</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>Inside Dhaka: ৳{settings.deliveryDhaka ?? 70}</li>
              <li>Dhaka Suburbs: ৳{settings.deliveryDhakaSuburbs ?? 100}</li>
              <li>Outside Dhaka: ৳{settings.deliveryOutsideDhaka ?? 130}</li>
              <li className="text-[#cc272d] font-semibold">
                Free Delivery over ৳{settings.freeDeliveryThreshold ?? 999}
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Contact Us</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#cc272d]" />
                <span>{settings.contactPhone || '+880 1700-000000'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#cc272d]" />
                <span>{settings.contactEmail || 'support@sokherstore.com'}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#cc272d]" />
                <span>{settings.contactAddress || 'Dhaka, Bangladesh'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} {settings.storeName || 'Sokher Store'}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-400">Payment Methods:</span>
            <span className="px-2 py-1 rounded bg-gray-900 text-gray-300 font-bold text-[10px]">Cash on Delivery</span>
            <span className="px-2 py-1 rounded bg-pink-950 text-pink-300 font-bold text-[10px]">bKash</span>
            <span className="px-2 py-1 rounded bg-orange-950 text-orange-300 font-bold text-[10px]">Nagad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
