'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/price-parser';

export default function CartDrawer() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#cc272d]" />
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Your Shopping Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#cc272d]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900">আপনার কার্টটি ফাঁকা রয়েছে</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-xs">
                  পছন্দের রূপচর্চার পণ্যগুলো কার্টে যোগ করুন এবং আকর্ষণীয় ছাড় উপভোগ করুন।
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[#cc272d] text-white text-xs sm:text-sm font-semibold hover:bg-red-700 transition"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variant || ''}`} className="flex gap-3 pt-3 first:pt-0">
                    {/* Item Image */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image
                        src={item.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.productId, item.variant)}
                            className="text-gray-400 hover:text-red-600 transition"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.variant && (
                          <span className="inline-block text-[11px] text-gray-500 font-medium mt-0.5">
                            {item.variant}
                          </span>
                        )}

                        <div className="text-xs sm:text-sm font-bold text-[#cc272d] mt-1">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 text-gray-600 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 hover:bg-gray-100 text-gray-600 transition disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] text-gray-400">
                          Total: {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
              {/* Rule #6: Clear Cart button */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Subtotal:</span>
                <span className="text-base font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={clearCart}
                  className="py-2 px-3 rounded-lg border border-red-200 text-[#cc272d] hover:bg-red-50 text-xs font-semibold transition"
                >
                  Clear Cart
                </button>

                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition"
                >
                  View Cart
                </Link>

                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#cc272d] hover:bg-red-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md transition"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
