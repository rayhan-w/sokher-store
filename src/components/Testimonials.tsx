'use client';

import React, { useRef } from 'react';
import { Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerified?: boolean;
}

interface TestimonialsProps {
  reviews: ReviewItem[];
}

export default function Testimonials({ reviews = [] }: TestimonialsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Deduplicate reviews by customerName + comment so each testimonial is only shown once
  const seen = new Set<string>();
  const uniqueReviews: ReviewItem[] = [];
  for (const r of reviews) {
    const key = `${r.customerName.toLowerCase().trim()}_${r.comment.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueReviews.push(r);
    }
  }

  // Source strictly from real reviews from DB / admin
  if (uniqueReviews.length === 0) return null;

  // Rule: If fewer than 3 exist, show them statically without duplication
  if (uniqueReviews.length < 3) {
    return (
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight text-center mb-5 sm:mb-8">
          Customer Testimonials
        </h2>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 py-2">
          {uniqueReviews.map((rev) => (
            <div
              key={rev.id}
              className="w-full sm:w-80 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-red-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5 Gold Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed line-clamp-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Author & Verified Label */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">
                  {rev.customerName || 'Happy Customer'}
                </span>

                {rev.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 3 or more: Carousel with Prev/Next buttons
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
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      <h2 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight text-center mb-5 sm:mb-8">
        Customer Testimonials
      </h2>

      <div className="relative group/testi">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition opacity-90 group-hover/testi:opacity-100"
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {uniqueReviews.map((rev) => (
            <div
              key={rev.id}
              className="w-72 sm:w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-red-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5 Gold Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed line-clamp-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Author & Verified Label */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">
                  {rev.customerName || 'Happy Customer'}
                </span>

                {rev.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={scrollRight}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white text-gray-800 border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition opacity-90 group-hover/testi:opacity-100"
          aria-label="Next testimonials"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
