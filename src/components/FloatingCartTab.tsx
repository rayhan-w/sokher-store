'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/price-parser';

export default function FloatingCartTab() {
  const { totalItems, subtotal, setIsCartDrawerOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setIsCartDrawerOpen(true)}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#cc272d] hover:bg-red-700 active:scale-95 text-white rounded-l-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center shadow-2xl transition-all duration-200 border-l-2 border-t-2 border-b-2 border-white/20 select-none group"
      aria-label="Floating cart widget"
    >
      <div className="relative">
        <ShoppingBag className="w-5 h-5 text-white group-hover:scale-105 transition-transform" />
      </div>
      <span className="text-[10px] font-bold mt-1 text-white whitespace-nowrap">
        {totalItems === 1 ? '1 Item' : `${totalItems} Items`}
      </span>
      <span className="text-[11px] font-black mt-0.5 text-white whitespace-nowrap">
        {formatPrice(subtotal)}
      </span>
    </button>
  );
}
