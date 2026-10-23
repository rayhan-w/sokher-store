'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Fallback slide matching the reference screenshot exactly
  const displaySlides: Slide[] =
    slides.length > 0
      ? slides
      : [
          {
            id: 'default-hero-1',
            badge: 'BEAUTY • SKINCARE • SELF CARE',
            title: 'Your Beauty, Our Passion',
            subtitle: 'Discover premium cosmetics & skincare products for a more confident you.',
            buttonText: 'Shop Now',
            buttonUrl: '/shop',
            imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
          },
        ];

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % displaySlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  const slide = displaySlides[currentIdx] || displaySlides[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#FFF0F3] via-[#FDE2E4] to-[#FFF0F3] border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left z-10">
            {slide.badge && (
              <span className="inline-block text-xs sm:text-sm font-semibold tracking-wider text-[#cc272d] uppercase">
                {slide.badge}
              </span>
            )}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
              {slide.title?.split(',').map((part, i) => (
                <span key={i} className={i === 1 ? 'block text-[#cc272d]' : 'block'}>
                  {part}
                  {i === 0 && slide.title?.includes(',') ? ',' : ''}
                </span>
              ))}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal">
              {slide.subtitle ||
                'Discover premium cosmetics & skincare products for a more confident you.'}
            </p>

            <div className="pt-2">
              <Link
                href={slide.buttonUrl || '/shop'}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#cc272d] text-white text-sm sm:text-base font-semibold shadow-lg shadow-red-500/25 hover:bg-red-700 hover:shadow-red-600/35 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>{slide.buttonText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Slider Dots */}
            {displaySlides.length > 1 && (
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-4">
                {displaySlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === currentIdx ? 'w-8 bg-[#cc272d]' : 'w-2.5 bg-rose-300 hover:bg-rose-400'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Visual Column (Reference Composition) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Soft circle podium background */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white/70 backdrop-blur-sm p-4 shadow-xl border border-white flex items-center justify-center">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title || 'Sokher Store Cosmetics'}
                  fill
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating Cursive Note badge matching reference screenshot */}
              <div className="absolute -top-3 -right-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg border border-rose-100 rotate-3 hidden sm:block">
                <p className="font-serif italic text-xs sm:text-sm text-[#cc272d] font-bold">
                  Because You Deserve the Best ❤️
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
