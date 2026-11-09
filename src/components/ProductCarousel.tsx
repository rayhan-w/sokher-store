'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface ProductCarouselProps {
  title: string;
  products: any[];
  viewAllLink?: string;
}

export default function ProductCarousel({ title, products, viewAllLink }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-5">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-xs sm:text-sm font-bold text-[#cc272d] hover:underline"
          >
            SEE ALL →
          </a>
        )}
      </div>

      {/* Carousel Container with Arrows */}
      <div className="relative group/carousel">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition opacity-90 group-hover/carousel:opacity-100"
          aria-label="Previous products"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[calc(50%-6px)] sm:w-[calc(33.333%-10px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] flex-shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={scrollRight}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition opacity-90 group-hover/carousel:opacity-100"
          aria-label="Next products"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </section>
  );
}
