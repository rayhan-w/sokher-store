'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, Truck, Package, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AnnouncementBarProps {
  settings: {
    announcementText?: string | null;
    isAnnouncementActive?: boolean;
    freeDeliveryThreshold?: number;
    contactPhone?: string | null;
    whatsappNumber?: string | null;
  };
}

export default function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const { user } = useAuth();

  if (settings.isAnnouncementActive === false) {
    return null;
  }

  const defaultThreshold = settings.freeDeliveryThreshold ?? 999;
  const hotline = settings.contactPhone || '+880 1700-000000';
  const whatsapp = settings.whatsappNumber || '+880 1700-000000';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');
  const cleanWa = whatsapp.replace(/[^0-9]/g, '');

  const announcement =
    settings.announcementText ||
    `সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি | ৳${defaultThreshold} বা তার বেশি অর্ডারে ফ্রি ডেলিভারি!`;

  return (
    // Hidden on mobile to match Ghorer Bazar clean mobile layout exactly
    <div className="hidden sm:block bg-[#b91c1c] text-white text-xs py-1.5 px-4 sm:px-6 border-b border-red-800/40 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Left: Hotline & WhatsApp */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <a
            href={`tel:${cleanPhone}`}
            className="flex items-center gap-1.5 font-medium hover:text-rose-200 transition"
            title="হটলাইনে কল করুন"
          >
            <Phone className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>
              হটলাইন: <strong className="font-bold">{hotline}</strong>
            </span>
          </a>

          <a
            href={`https://wa.me/${cleanWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 hover:text-emerald-300 transition"
            title="WhatsApp-এ যোগাযোগ করুন"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">WhatsApp</span>
          </a>
        </div>

        {/* Center: Delivery Ticker */}
        <div className="flex items-center justify-center gap-2 text-rose-100 flex-1 truncate px-4">
          <Truck className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
          <span className="truncate font-medium">{announcement}</span>
        </div>

        {/* Right: Track Order & User Auth */}
        <div className="flex items-center gap-4 font-medium flex-shrink-0">
          <Link
            href="/account"
            className="flex items-center gap-1 text-rose-100 hover:text-white transition"
          >
            <Package className="w-3.5 h-3.5 text-yellow-300" />
            <span>অর্ডার ট্র্যাক</span>
          </Link>

          <span className="text-red-400">|</span>

          {user ? (
            <Link
              href={user.role === 'ADMIN' ? '/admin' : '/account'}
              className="flex items-center gap-1 hover:text-rose-200 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">{user.name}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 hover:text-rose-200 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>লগইন / রেজিস্টার</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
