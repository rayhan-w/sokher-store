'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Truck, CreditCard, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/price-parser';

interface CheckoutFormProps {
  settings: {
    deliveryDhaka: number;
    deliveryDhakaSuburbs: number;
    deliveryOutsideDhaka: number;
    freeDeliveryThreshold: number;
    bkashNumber?: string | null;
    nagadNumber?: string | null;
  };
}

export default function CheckoutFormClient({ settings }: CheckoutFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, appliedCoupon, clearCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'DHAKA' | 'DHAKA_SUBURB' | 'OUTSIDE_DHAKA'>('DHAKA');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD'>('COD');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delivery Charge Calculation from Single Source Settings
  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  let deliveryCharge = 0;

  if (!isFreeDelivery) {
    if (deliveryZone === 'DHAKA') deliveryCharge = settings.deliveryDhaka;
    else if (deliveryZone === 'DHAKA_SUBURB') deliveryCharge = settings.deliveryDhakaSuburbs;
    else if (deliveryZone === 'OUTSIDE_DHAKA') deliveryCharge = settings.deliveryOutsideDhaka;
  }

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, subtotal + deliveryCharge - discountAmount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('আপনার কার্ট খালি রয়েছে (Cart is empty).');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম দিন।');
      return;
    }

    if (!customerPhone.trim() || !/^01[3-9]\d{8}$/.test(customerPhone.trim().replace(/[^0-9]/g, ''))) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।');
      return;
    }

    if (!shippingAddress.trim()) {
      setErrorMsg('সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (রোড, বাসা, থানা/এলাকা)।');
      return;
    }

    if ((paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') && (!senderNumber.trim() || !trxId.trim())) {
      setErrorMsg('অনুগ্রহ করে বিকাশ/নগদ প্রেরক নম্বর এবং TrxID প্রদান করুন।');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        shippingAddress: shippingAddress.trim(),
        deliveryZone,
        orderNotes: orderNotes.trim() || null,
        paymentMethod,
        senderNumber: senderNumber.trim() || null,
        trxId: trxId.trim() || null,
        couponCode: appliedCoupon?.code || null,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variant: i.variant,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'অর্ডার সম্পন্ন করা যায়নি।');
        setLoading(false);
        return;
      }

      // Tracking Event: Purchase (Dual Browser + Server CAPI with single event_id)
      const eventId = `purchase_${data.orderNumber}_${Date.now()}`;
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq(
          'track',
          'Purchase',
          {
            currency: 'BDT',
            value: totalAmount,
            content_type: 'product',
            order_id: data.orderNumber,
          },
          { eventID: eventId }
        );
      }

      // Clear the Cart after placing order
      clearCart();

      // Redirect to Order Success Page
      router.push(`/order-success/${data.orderNumber}`);
    } catch {
      setErrorMsg('সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#cc272d] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">চেকআউট করার জন্য কার্টে কোনো পণ্য নেই</h2>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 rounded-full bg-[#cc272d] text-white text-sm font-semibold hover:bg-red-700 shadow-md transition"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitOrder}>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8">Checkout & Place Order</h1>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Customer & Delivery & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer Information */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#cc272d] text-white text-xs flex items-center justify-center font-bold">1</span>
              Customer Details (ক্রেতার তথ্য)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name (আপনার নাম) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number (মোবাইল নম্বর) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01712345678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address (ইমেইল - ঐচ্ছিক)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Delivery Address (সম্পূর্ণ ঠিকানা) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="বাসা নম্বর, রোড নম্বর, এলাকা/থানা, জেলা"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Zone Selection */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#cc272d] text-white text-xs flex items-center justify-center font-bold">2</span>
              Delivery Zone (ডেলিভারি এলাকা)
            </h2>

            <div className="space-y-3">
              {[
                {
                  id: 'DHAKA',
                  label: 'Inside Dhaka (ঢাকা সিটি)',
                  charge: settings.deliveryDhaka,
                  desc: 'ডেলিভারি সময়: ২৪-৪৮ ঘণ্টা',
                },
                {
                  id: 'DHAKA_SUBURB',
                  label: 'Dhaka Suburbs (সাভার, কেরানীগঞ্জ, টঙ্গী, গাজীপুর)',
                  charge: settings.deliveryDhakaSuburbs,
                  desc: 'ডেলিভারি সময়: ২-৩ দিন',
                },
                {
                  id: 'OUTSIDE_DHAKA',
                  label: 'Outside Dhaka (ঢাকার বাইরে সারা বাংলাদেশ)',
                  charge: settings.deliveryOutsideDhaka,
                  desc: 'হোম ডেলিভারি: ৩-৪ দিন',
                },
              ].map((zone) => (
                <label
                  key={zone.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    deliveryZone === zone.id
                      ? 'border-[#cc272d] bg-rose-50/50 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryZone"
                      value={zone.id}
                      checked={deliveryZone === zone.id}
                      onChange={() => setDeliveryZone(zone.id as any)}
                      className="text-[#cc272d] focus:ring-[#cc272d]"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">{zone.label}</p>
                      <p className="text-[11px] text-gray-500">{zone.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#cc272d]">
                    {isFreeDelivery ? 'FREE' : formatPrice(zone.charge)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#cc272d] text-white text-xs flex items-center justify-center font-bold">3</span>
              Payment Method (পেমেন্ট পদ্ধতি)
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-[#cc272d] bg-rose-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-[#cc272d] focus:ring-[#cc272d]"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">Cash on Delivery (ক্যাশ অন ডেলিভারি)</p>
                    <p className="text-[11px] text-gray-500">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</p>
                  </div>
                </div>
              </label>

              {/* bKash Manual */}
              <label
                className={`block p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'BKASH'
                    ? 'border-[#cc272d] bg-pink-50/40 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BKASH"
                    checked={paymentMethod === 'BKASH'}
                    onChange={() => setPaymentMethod('BKASH')}
                    className="text-[#cc272d] focus:ring-[#cc272d]"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-pink-700">bKash Payment (বিকাশ)</p>
                    <p className="text-[11px] text-gray-500">বিকাশ সেন্ড মানি বা পেমেন্ট করে TrxID দিন।</p>
                  </div>
                </div>

                {paymentMethod === 'BKASH' && (
                  <div className="mt-4 pt-3 border-t border-pink-100 text-xs space-y-3">
                    <p className="text-gray-700 font-medium">
                      আমাদের বিকাশ মার্চেন্ট/পার্সোনাল নম্বর: <strong className="text-pink-600 font-bold">{settings.bkashNumber || '01712345678'}</strong>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          আপনার বিকাশ নম্বর (Sender Number) *
                        </label>
                        <input
                          type="tel"
                          placeholder="017XXXXXXXX"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          TrxID (ট্রানজেকশন আইডি) *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 9J4K2L8"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </label>

              {/* Nagad Manual */}
              <label
                className={`block p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'NAGAD'
                    ? 'border-[#cc272d] bg-orange-50/40 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="NAGAD"
                    checked={paymentMethod === 'NAGAD'}
                    onChange={() => setPaymentMethod('NAGAD')}
                    className="text-[#cc272d] focus:ring-[#cc272d]"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-orange-700">Nagad Payment (নগদ)</p>
                    <p className="text-[11px] text-gray-500">নগদ সেন্ড মানি করে TrxID প্রদান করুন।</p>
                  </div>
                </div>

                {paymentMethod === 'NAGAD' && (
                  <div className="mt-4 pt-3 border-t border-orange-100 text-xs space-y-3">
                    <p className="text-gray-700 font-medium">
                      আমাদের নগদ নম্বর: <strong className="text-orange-600 font-bold">{settings.nagadNumber || '01812345678'}</strong>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          আপনার নগদ নম্বর (Sender Number) *
                        </label>
                        <input
                          type="tel"
                          placeholder="018XXXXXXXX"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          TrxID (ট্রানজেকশন আইডি) *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 7A8B9C1"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Line Items Snapshot & Place Order */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Your Order ({items.length} items)
          </h2>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variant || ''}`} className="py-3 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 truncate">{item.name}</h4>
                  <p className="text-[11px] text-gray-500">
                    Qty: {item.quantity} {item.variant ? `(${item.variant})` : ''}
                  </p>
                </div>
                <span className="text-xs font-bold text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2.5 text-xs sm:text-sm border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span>- {formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span className="font-bold text-gray-900">
                {isFreeDelivery ? 'FREE (৳0)' : formatPrice(deliveryCharge)}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-lg font-black text-gray-950">
              <span>Total Payable</span>
              <span className="text-[#cc272d]">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-[#cc272d] hover:bg-red-700 text-white text-sm sm:text-base font-bold shadow-xl shadow-red-500/25 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40"
          >
            {loading ? 'অর্ডার প্রসেস হচ্ছে...' : `Confirm Order (${formatPrice(totalAmount)})`}
          </button>
        </div>
      </div>
    </form>
  );
}
