'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, LayoutGrid } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  productCount?: number;
}

interface CategoryCirclesProps {
  categories: CategoryItem[];
}

export default function CategoryCircles({ categories = [] }: CategoryCirclesProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Section Header (Ghorer Bazar Style) */}
      <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#cc272d] uppercase tracking-wider mb-1">
            <LayoutGrid className="w-4 h-4" />
            <span>জনপ্রিয় ক্যাটাগরি সমূহ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ক্যাটাগরি অনুযায়ী শপ করুন
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#cc272d] hover:text-red-700 hover:underline"
        >
          <span>সব ক্যাটাগরি</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Categories Grid (Clean Rounded Bordered Cards) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-5 text-center">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center p-3 rounded-2xl bg-white border border-gray-200 hover:border-[#cc272d] hover:shadow-lg transition-all duration-300"
          >
            {/* Image Circle Container */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-rose-50 border border-red-100 group-hover:scale-105 group-hover:bg-[#cc272d]/10 transition-all duration-300">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-lg font-black text-[#cc272d]">
                    {cat.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Category Name */}
            <span className="mt-3 text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#cc272d] transition line-clamp-1">
              {cat.name}
            </span>

            {/* Product Count or View */}
            <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-gray-600 transition">
              {cat.productCount ? `${cat.productCount} টি পণ্য` : 'পণ্য দেখুন'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
