import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { ShoppingCart, CheckSquare, Truck, CreditCard } from 'lucide-react';

export default async function HowToOrderPage() {
  const [settings, categories] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { subcategories: true },
    }),
  ]);

  const defaultSettings: any = settings || {
    storeName: 'Sokher Store',
    contactPhone: '+880 1700-000000',
  };

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={categories as any} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        <nav className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d]">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-gray-900">How to Order</span>
        </nav>

        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <ShoppingCart className="w-4 h-4" />
            <span>Easy Ordering Guide</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            How to Place an Order
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Order in less than 60 seconds with our hassle-free Cash on Delivery process.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#cc272d] font-black flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-gray-900">Choose Products</h3>
              <p className="text-xs text-gray-500">
                Browse our categories and click &ldquo;Add to Cart&rdquo; or &ldquo;Buy Now&rdquo; on the items you wish to purchase.
              </p>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#cc272d] font-black flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-gray-900">Go to Checkout</h3>
              <p className="text-xs text-gray-500">
                Open your cart drawer or click Checkout. Enter your name, mobile number, and full shipping address.
              </p>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#cc272d] font-black flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-gray-900">Select Area</h3>
              <p className="text-xs text-gray-500">
                Choose &ldquo;Inside Dhaka&rdquo; (৳70) or &ldquo;Outside Dhaka&rdquo; (৳130). Orders above ৳999 get free shipping.
              </p>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#cc272d] font-black flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-bold text-gray-900">Confirm & Receive</h3>
              <p className="text-xs text-gray-500">
                Click &ldquo;Confirm Order&rdquo;. You will receive an instant order number and SMS. Pay cash upon delivery!
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              Prefer ordering over the phone or WhatsApp? We can take your order directly!
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${defaultSettings.contactPhone?.replace(/[^0-9+]/g, '') || '+8801700000000'}`}
                className="px-4 py-2 bg-gray-950 text-white font-bold rounded-lg text-xs hover:bg-black transition"
              >
                Call Hotline
              </a>
              <Link
                href="/shop"
                className="px-4 py-2 bg-[#cc272d] text-white font-bold rounded-lg text-xs hover:bg-red-700 transition"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={categories as any} />
    </div>
  );
}
