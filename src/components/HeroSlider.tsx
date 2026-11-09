'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Slide {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  imageUrl: string;
}

interface HeroSliderProps {
  slides?: Slide[];
}

export default function HeroSlider({ slides = [] }: HeroSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const displaySlides: Slide[] =
    slides.length > 0
      ? slides
      : [
          {
            id: 'default-hero-1',
            badge: '১০০% অরিজিনাল কসমেটিক্স',
            title: 'শখের স্টোর — আপনার রূপচর্চার বিশ্বস্ত ঠিকানা',
            subtitle: 'প্রিমিয়াম কোয়ালিটি মেকআপ ও স্কিনকেয়ারে আকর্ষণীয় ছাড়',
            buttonText: 'অর্ডার করুন',
            buttonUrl: '/shop',
            imageUrl:
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
          },
          {
            id: 'default-hero-2',
            badge: 'নতুন কালেকশন ২০২৬',
            title: 'ন্যাচারাল গ্লো ও প্রিমিয়াম স্কিনকেয়ার',
            subtitle: 'সব ধরনের ত্বকের জন্য সেরা সমাধান',
            buttonText: 'সকল পণ্য',
            buttonUrl: '/shop',
            imageUrl:
              'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop&q=80',
          },
        ];

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  const slide = displaySlides[currentIdx] || displaySlides[0];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-4 pb-1 sm:pb-3">
      {/* Compact Responsive Banner Container (Ghorer Bazar Style) */}
      <div className="relative w-full h-36 sm:h-52 md:h-72 lg:h-80 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-gray-900 group">
        {/* Background Image */}
        <Image
          src={slide.imageUrl}
          alt={slide.title || 'Sokher Store Banner'}
          fill
          priority
          className="object-cover object-center group-hover:scale-102 transition-transform duration-700"
        />

        {/* Soft Dark / Brand Gradient Overlay for perfect readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

        {/* Banner Content Overlay (Compact & Punchy on Mobile) */}
        <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-10 max-w-xl z-10 text-white">
          {slide.badge && (
            <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black bg-[#cc272d] text-white shadow-xs mb-1 sm:mb-2">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>{slide.badge}</span>
            </span>
          )}

          <h2 className="text-sm sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight sm:leading-snug line-clamp-2">
            {slide.title}
          </h2>

          {slide.subtitle && (
            <p className="hidden sm:block text-xs sm:text-sm text-gray-200 mt-1 line-clamp-1 max-w-md">
              {slide.subtitle}
            </p>
          )}

          <div className="mt-2 sm:mt-4">
            <Link
              href={slide.buttonUrl || '/shop'}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-lg bg-[#cc272d] hover:bg-red-700 active:scale-95 text-white text-[11px] sm:text-xs font-black shadow-md transition"
            >
              <span>{slide.buttonText || 'অর্ডার করুন'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Prev / Next Arrows (Visible on hover on sm+) */}
        {displaySlides.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIdx((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)
              }
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs transition z-20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIdx((prev) => (prev + 1) % displaySlides.length)}
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs transition z-20"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Slider Dots */}
        {displaySlides.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {displaySlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIdx ? 'w-5 bg-[#cc272d]' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
