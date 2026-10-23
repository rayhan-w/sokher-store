import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import prisma from '@/lib/prisma';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/price-parser';

export const revalidate = 0;

export default async function OrderSuccessPage({ params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <AnnouncementBar settings={{ isAnnouncementActive: true, freeDeliveryThreshold: 999 }} />
      <Header settings={{ storeName: 'Sokher Store' }} categories={[]} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mt-1">
              ধন্যবাদ! আপনার অর্ডারটি গৃহীত হয়েছে।
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              আপনার অর্ডার নম্বর: <strong className="text-gray-900 font-bold">{order.orderNumber}</strong>
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-gray-50/70 rounded-2xl p-6 text-left text-xs sm:text-sm space-y-3 border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer Name:</span>
              <span className="font-bold text-gray-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone:</span>
              <span className="font-bold text-gray-900">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-medium text-gray-800 text-right max-w-xs">{order.shippingAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-bold text-[#cc272d]">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
              <span className="font-bold text-gray-900">Total Amount:</span>
              <span className="font-black text-[#cc272d]">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#cc272d] hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition shadow-md"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition"
            >
              View Order History
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={{ storeName: 'Sokher Store' }} />
    </div>
  );
}
