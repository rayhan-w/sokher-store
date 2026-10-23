'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Trash2, ArrowRight, Tag, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/price-parser';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    appliedCoupon,
    setAppliedCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setLoadingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'ভুল বা মেয়াদোত্তীর্ণ কুপন কোড।');
      } else {
        setAppliedCoupon({
          code: data.couponCode,
          discountAmount: data.discountAmount,
        });
        setCouponSuccess(data.message || 'কুপন সফলভাবে যোগ হয়েছে!');
        setCouponInput('');
      }
    } catch {
      setCouponError('কুপন যাচাই করতে সমস্যা হয়েছে।');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <AnnouncementBar settings={{ isAnnouncementActive: true, freeDeliveryThreshold: 999 }} />
      <Header settings={{ storeName: 'Sokher Store' }} categories={[]} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d]">Home</Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">Shopping Cart</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8">
          Shopping Cart ({items.length} items)
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-[#cc272d] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">আপনার শপিং কার্ট খালি রয়েছে</h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              আপনার পছন্দের কসমেটিকস ও স্কিনকেয়ার পণ্যগুলো শপ পেইজ থেকে ব্রাউজ করে যোগ করুন।
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 rounded-full bg-[#cc272d] text-white text-sm font-semibold hover:bg-red-700 shadow-md transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Table */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Products</span>
                {/* Rule #6: Clear Cart Button */}
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variant || ''}`}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#cc272d] transition line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p className="text-[11px] text-gray-500 mt-0.5">Variant: {item.variant}</p>
                        )}
                        <p className="text-xs font-bold text-[#cc272d] mt-1">{formatPrice(item.price)}</p>
                      </div>
                    </div>

                    {/* Qty & Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 transition"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 transition disabled:opacity-40"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-gray-900 w-20 text-right">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.variant)}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Summary Box */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Order Summary
              </h2>

              {/* Coupon Code Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Have a Coupon Code?</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
                    <div>
                      <span className="font-bold text-emerald-800">Code: {appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-600">৳{appliedCoupon.discountAmount} discount applied</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SOKHER10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] uppercase"
                    />
                    <button
                      type="submit"
                      disabled={loadingCoupon || !couponInput.trim()}
                      className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition disabled:opacity-40"
                    >
                      {loadingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2.5 text-xs sm:text-sm border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="text-gray-500 italic text-xs">Calculated at checkout</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-base font-extrabold text-gray-950">
                  <span>Estimated Total</span>
                  <span className="text-[#cc272d]">{formatPrice(estimatedTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-2 text-center flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Secure Checkout Guarantee</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer settings={{ storeName: 'Sokher Store' }} />
    </div>
  );
}
