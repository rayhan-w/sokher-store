'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <AnnouncementBar settings={{ isAnnouncementActive: true, freeDeliveryThreshold: 999 }} />
      <Header settings={{ storeName: 'Sokher Store' }} categories={[]} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <Heart className="w-7 h-7 text-[#cc272d] fill-[#cc272d]" />
              <span>My Wishlist ({items.length})</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">আপনার পছন্দের সংরক্ষিত পণ্য তালিকা</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#cc272d]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-[#cc272d] flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">আপনার উইশলিস্টে কোনো পণ্য নেই</h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              পছন্দের পণ্যের ওপর হার্ট আইকনে ক্লিক করে উইশলিস্টে সংরক্ষণ করুন।
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 rounded-full bg-[#cc272d] text-white text-xs sm:text-sm font-semibold hover:bg-red-700 shadow-md transition"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {items.map((item) => (
              <ProductCard
                key={item.productId}
                product={{
                  id: item.productId,
                  name: item.name,
                  slug: item.slug,
                  sku: item.productId,
                  price: item.price,
                  regularPrice: item.regularPrice,
                  stock: 50,
                  badge: item.badge,
                  images: [item.image],
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer settings={{ storeName: 'Sokher Store' }} />
    </div>
  );
}
