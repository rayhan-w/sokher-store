'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Phone, MapPin, User, DollarSign, ShieldAlert } from 'lucide-react';
import { formatPrice } from '@/lib/price-parser';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      setOrder(data.order || null);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [params.id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === 'CANCELLED') {
      const confirmCancel = confirm(
        'আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান? এতে পণ্যের স্টক ঠিক একবার ডেটাবেসে ফেরত আসবে।'
      );
      if (!confirmCancel) return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        setToast(data.message || `অর্ডার স্ট্যাটাস ${newStatus} করা হয়েছে।`);
        fetchOrderDetail();
        setTimeout(() => setToast(null), 4000);
      } else {
        alert(data.error || 'আপডেট করতে সমস্যা হয়েছে।');
      }
    } catch {
      alert('সার্ভারে সমস্যা হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async (newPaymentStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        setToast(`পেমেন্ট স্ট্যাটাস ${newPaymentStatus} করা হয়েছে।`);
        fetchOrderDetail();
        setTimeout(() => setToast(null), 3500);
      }
    } catch {
      alert('সার্ভারে সমস্যা হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !order) {
    return <div className="p-8 text-xs text-gray-500">অর্ডার বিস্তারিত লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 font-mono">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleString('bn-BD')}
            </p>
          </div>
        </div>

        {/* Status Transition Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <select
            value={order.orderStatus}
            disabled={actionLoading}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled (Restores Stock)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Snapshot Line Items (Rule #5) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Purchased Products Snapshot ({order.items?.length || 0})
          </h2>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item: any) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                    <Image
                      src={item.productImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'}
                      alt={item.productName}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      SKU: {item.productSku || 'N/A'} {item.variant ? `• Variant: ${item.variant}` : ''}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-bold text-gray-900 text-xs sm:text-sm">
                  {formatPrice(item.lineTotal)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 border-t border-gray-100 pt-4 text-xs sm:text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({order.couponCode}):</span>
                <span>- {formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge ({order.deliveryZone}):</span>
              <span className="font-bold text-gray-900">{formatPrice(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-black text-gray-950">
              <span>Total Amount:</span>
              <span className="text-[#cc272d]">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Right: Customer & Payment Verification */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
              Customer Information
            </h3>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <strong className="text-gray-900">{order.customerName}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{order.customerPhone}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                <span>{order.shippingAddress}</span>
              </p>
            </div>
          </div>

          {/* Payment Verification Queue */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center justify-between">
              <span>Payment Details</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.paymentStatus}
              </span>
            </h3>

            <div className="space-y-2 text-gray-700">
              <p>
                Method: <strong className="text-gray-900">{order.paymentMethod}</strong>
              </p>
              {order.senderNumber && (
                <p>
                  Sender Number: <strong className="font-mono text-gray-900">{order.senderNumber}</strong>
                </p>
              )}
              {order.trxId && (
                <p>
                  Transaction ID: <strong className="font-mono text-pink-700">{order.trxId}</strong>
                </p>
              )}
            </div>

            {/* Quick Verification Buttons */}
            {order.paymentMethod !== 'COD' && (
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdatePayment('PAID')}
                  disabled={actionLoading || order.paymentStatus === 'PAID'}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition disabled:opacity-40"
                >
                  Mark as Paid ✓
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdatePayment('REJECTED')}
                  disabled={actionLoading || order.paymentStatus === 'REJECTED'}
                  className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-red-600 font-bold text-[11px] transition"
                >
                  Reject ✕
                </button>
              </div>
            )}
          </div>

          {/* Stock Restoration Status Note (Rule #7) */}
          {order.isStockRestored && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>এই অর্ডারের জন্য পণ্য স্টক ফিরিয়ে নেওয়া হয়েছে (Stock Restored).</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
