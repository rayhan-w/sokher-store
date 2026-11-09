'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!categories || categories.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 relative">
      {/* Exact Match to Screenshot: Centered "Featured Categories" */}
      <h2 className="text-base sm:text-xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
        Featured Categories
      </h2>

      {/* Categories Row with Side Navigation Arrow */}
      <div className="relative group/cat">
        {/* Left Arrow Button (Exact match to screenshot's left orange/red pill button) */}
        <button
          onClick={scrollLeft}
          className="absolute -left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#cc272d] text-white flex items-center justify-center shadow-md hover:bg-red-700 active:scale-95 transition"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Squircle Category Cards Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-6 scroll-smooth"
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex-shrink-0 group flex flex-col items-center focus:outline-none"
            >
              {/* Squircle Card (Rounded-3xl white card with soft shadow) */}
              <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-3xl bg-white shadow-xs border border-gray-100/90 flex items-center justify-center p-3.5 group-hover:border-red-200 group-hover:shadow-md transition-all duration-300">
                <div className="relative w-full h-full">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain p-1 group-hover:scale-108 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-rose-50 flex items-center justify-center text-lg font-black text-[#cc272d]">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Title Underneath Card */}
              <span className="mt-2 text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#cc272d] text-center max-w-[6.5rem] truncate">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={scrollRight}
          className="absolute -right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#cc272d] text-white flex items-center justify-center shadow-md hover:bg-red-700 active:scale-95 transition"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
