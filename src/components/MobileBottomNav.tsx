'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, Grid, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { totalWishlist } = useWishlist();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const items = [
    { label: 'Home', href: '/', icon: Home, isActive: pathname === '/' },
    { label: 'Shop', href: '/shop', icon: Store, isActive: pathname === '/shop' },
    { label: 'Categories', href: '/shop', icon: Grid, isActive: false },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart, badge: totalWishlist, isActive: pathname === '/account/wishlist' },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 relative py-1 px-2 text-[10px] font-medium transition ${
                item.isActive ? 'text-[#cc272d] font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#cc272d] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Cart Button */}
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="flex flex-col items-center gap-1 relative py-1 px-2 text-[10px] font-medium text-gray-500 hover:text-gray-900"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#cc272d] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>
      </div>
    </div>
  );
}
