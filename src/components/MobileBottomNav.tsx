'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, PhoneCall, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/price-parser';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, subtotal, setIsCartDrawerOpen } = useCart();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-1 px-2 shadow-2xl">
      <div className="grid grid-cols-5 items-center text-center">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1.5 transition ${
            pathname === '/' ? 'text-[#cc272d] font-bold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">হোম</span>
        </Link>

        {/* 2. Categories */}
        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center py-1.5 transition ${
            pathname === '/shop' ? 'text-[#cc272d] font-bold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ক্যাটাগরি</span>
        </Link>

        {/* 3. Hotline Call (Instant Direct Dial) */}
        <a
          href="tel:+8801700000000"
          className="flex flex-col items-center justify-center py-1.5 text-gray-600 hover:text-[#cc272d] transition"
        >
          <div className="w-7 h-7 rounded-full bg-rose-50 border border-red-200 text-[#cc272d] flex items-center justify-center shadow-sm">
            <PhoneCall className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-[#cc272d]">কল করুন</span>
        </a>

        {/* 4. Cart (With badge count & price) */}
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 text-gray-600 hover:text-[#cc272d] transition relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#cc272d] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">
            {totalItems > 0 ? formatPrice(subtotal) : 'কার্ট'}
          </span>
        </button>

        {/* 5. Account */}
        <Link
          href="/account"
          className={`flex flex-col items-center justify-center py-1.5 transition ${
            pathname.startsWith('/account') || pathname === '/login'
              ? 'text-[#cc272d] font-bold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">অ্যাকাউন্ট</span>
        </Link>
      </div>
    </div>
  );
}
