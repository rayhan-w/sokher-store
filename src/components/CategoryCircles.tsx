'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, LayoutGrid } from 'lucide-react';

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
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
      {/* Category Section Header (Compact) */}
      <div className="flex items-center justify-between mb-2.5 sm:mb-4 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-rose-50 text-[#cc272d] flex items-center justify-center">
            <LayoutGrid className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm sm:text-lg font-black text-gray-950 tracking-tight">
            ক্যাটাগরি সমূহ (Categories)
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center text-[11px] sm:text-xs font-bold text-[#cc272d] hover:underline"
        >
          <span>সব দেখুন</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Scroll on Mobile + Grid on Desktop (Ghorer Bazar Style) */}
      <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex-shrink-0 w-20 sm:w-auto group flex flex-col items-center text-center p-2 rounded-xl bg-white border border-gray-100 hover:border-[#cc272d] hover:shadow-md transition-all duration-200"
          >
            {/* Category Circular Thumbnail */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-rose-200 to-white shadow-2xs group-hover:scale-105 transition-transform duration-300">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-rose-50 flex items-center justify-center">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-base font-black text-[#cc272d]">
                    {cat.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            {/* Category Name */}
            <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-gray-800 group-hover:text-[#cc272d] transition line-clamp-1 w-full">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
