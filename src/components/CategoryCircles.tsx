'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Explore our wide range of cosmetics & beauty care</p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#cc272d] hover:text-red-700 hover:underline"
        >
          View All Categories
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6 text-center">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-tr from-rose-200 via-rose-100 to-white shadow-md group-hover:shadow-rose-400/30 group-hover:scale-105 transition-all duration-300">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-rose-50 flex items-center justify-center">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-lg font-bold text-[#cc272d]">{cat.name.charAt(0)}</span>
                )}
              </div>
            </div>
            <span className="mt-2.5 text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#cc272d] transition line-clamp-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
