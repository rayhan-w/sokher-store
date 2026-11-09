'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, Search, User, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartDrawerOpen } = useCart();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleOpenMenu = () => {
    window.dispatchEvent(new CustomEvent('open-mobile-menu'));
  };

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('open-mobile-search'));
  };

  return (
    <>
      {/* Floating Circular Green WhatsApp Chat Button (Bottom-Right, Strict Colour Rule: Green ONLY for WhatsApp) */}
      <a
        href="https://wa.me/8801700000000?text=Hello%20Sokher%20Store%2C%20I%20have%20an%20inquiry%20about%20a%20product"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 sm:bottom-8 right-4 z-40 w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white flex items-center justify-center shadow-2xl transition border-2 border-white/20 select-none"
        aria-label="WhatsApp Support"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
      </a>

      {/* Solid Brand-Colored Mobile Bottom Bar (HOME, MENU, CART, SEARCH, ACCOUNT) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#cc272d] text-white py-1.5 px-1 shadow-2xl select-none border-t border-red-700/50">
        <div className="grid grid-cols-5 items-center text-center">
          {/* 1. HOME */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center py-1 text-white hover:text-rose-100 active:scale-95 transition"
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">HOME</span>
          </Link>

          {/* 2. MENU */}
          <button
            onClick={handleOpenMenu}
            className="flex flex-col items-center justify-center py-1 text-white hover:text-rose-100 active:scale-95 transition"
          >
            <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">MENU</span>
          </button>

          {/* 3. CART (With circular count badge) */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-white hover:text-rose-100 active:scale-95 transition relative"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute -top-1.5 -right-2 bg-white text-[#cc272d] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            </div>
            <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">CART</span>
          </button>

          {/* 4. SEARCH */}
          <button
            onClick={handleOpenSearch}
            className="flex flex-col items-center justify-center py-1 text-white hover:text-rose-100 active:scale-95 transition"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">SEARCH</span>
          </button>

          {/* 5. ACCOUNT */}
          <Link
            href="/account"
            className="flex flex-col items-center justify-center py-1 text-white hover:text-rose-100 active:scale-95 transition"
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">ACCOUNT</span>
          </Link>
        </div>
      </div>
    </>
  );
}
