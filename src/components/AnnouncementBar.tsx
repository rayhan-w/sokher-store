'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, RotateCcw, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AnnouncementBarProps {
  settings: {
    announcementText?: string | null;
    isAnnouncementActive?: boolean;
    freeDeliveryThreshold?: number;
  };
}

export default function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const { user } = useAuth();

  if (settings.isAnnouncementActive === false) {
    return null;
  }

  const defaultThreshold = settings.freeDeliveryThreshold ?? 999;
  const announcementText =
    settings.announcementText ||
    `Free Shipping on orders over ৳${defaultThreshold} | 100% Authentic Products | Easy Return & Refund`;

  return (
    <div className="bg-[#cc272d] text-white text-xs py-2 px-4 border-b border-red-700/30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-6 overflow-x-auto text-[11px] sm:text-xs">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <Truck className="w-3.5 h-3.5" />
            Free Shipping on orders over ৳{defaultThreshold}
          </span>
          <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Authentic Products
          </span>
          <span className="hidden lg:flex items-center gap-1.5 whitespace-nowrap">
            <RotateCcw className="w-3.5 h-3.5" />
            Easy Return & Refund
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] sm:text-xs font-medium">
          {user ? (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <Link href={user.role === 'ADMIN' ? '/admin' : '/account'} className="hover:underline">
                {user.name} ({user.role === 'ADMIN' ? 'Admin Panel' : 'My Account'})
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <Link href="/login" className="hover:underline">
                Login / Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
