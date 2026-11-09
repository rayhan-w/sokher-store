'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/price-parser';

export default function CartDrawer() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    addToCart,
    subtotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

  // Fetch "You May Also Like" suggestions when drawer opens
  useEffect(() => {
    if (!isCartDrawerOpen) return;

    let mounted = true;
    fetch('/api/products?limit=6')
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data?.products) {
          // Filter out items already in cart
          const cartIds = new Set(items.map((i) => i.productId));
          const available = data.products.filter((p: any) => !cartIds.has(p.id));
          setSuggestedProducts(available.slice(0, 4));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [isCartDrawerOpen, items]);

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header: "SHOPPING CART" with "Close →" control */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-gray-950">
              SHOPPING CART
            </h2>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#cc272d] transition group"
              aria-label="Close Cart"
            >
              <span>Close</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-[#cc272d]">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-gray-900">No items in your cart!</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Your beauty cart is looking a little empty. Browse our catalog and treat yourself!
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-red-600/20"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variant || ''}`}
                    className="flex gap-3 pt-3 first:pt-0"
                  >
                    {/* Item Image */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-200">
                      <Image
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'
                        }
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.productId, item.variant)}
                            className="text-gray-400 hover:text-[#cc272d] transition"
                            aria-label="Remove item"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.variant && (
                          <span className="inline-block text-[11px] text-gray-500 font-medium mt-0.5">
                            {item.variant}
                          </span>
                        )}

                        <div className="text-xs sm:text-sm font-black text-[#cc272d] mt-1">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.variant, item.quantity - 1)
                            }
                            className="p-1 hover:bg-gray-100 text-gray-600 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.variant, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="p-1 hover:bg-gray-100 text-gray-600 transition disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] text-gray-500 font-semibold">
                          Total: {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* "You May Also Like" Row Above Footer */}
          {items.length > 0 && suggestedProducts.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/70 p-3.5">
              <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-wider mb-2.5">
                You May Also Like
              </h4>
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {suggestedProducts.map((p) => {
                  const pImg =
                    p.images?.[0] ||
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500';
                  return (
                    <div
                      key={p.id}
                      className="w-36 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-2 flex flex-col justify-between shadow-2xs"
                    >
                      <div className="relative w-full h-20 bg-gray-50 rounded-lg overflow-hidden mb-1.5">
                        <Image src={pImg} alt={p.name} fill className="object-contain p-1" />
                      </div>
                      <p className="text-[11px] font-bold text-gray-900 line-clamp-1 mb-1">
                        {p.name}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-100">
                        <span className="text-[11px] font-black text-[#cc272d]">
                          {formatPrice(p.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            addToCart(
                              {
                                productId: p.id,
                                name: p.name,
                                slug: p.slug,
                                price: p.price,
                                regularPrice: p.regularPrice,
                                image: pImg,
                                sku: p.sku,
                                stock: p.stock,
                              },
                              1
                            )
                          }
                          className="px-2 py-0.5 rounded-full bg-[#cc272d] hover:bg-red-700 text-white text-[10px] font-bold transition active:scale-95"
                          title="Add to Cart"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer: "Total: ৳X" + ONE full-width red "CHECKOUT" button */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-200 bg-white space-y-3">
              <div className="flex items-center justify-between text-base font-black">
                <span className="text-gray-900">Total:</span>
                <span className="text-[#cc272d] text-lg">{formatPrice(subtotal)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition active:scale-95 uppercase tracking-wider"
              >
                <span>CHECKOUT</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
