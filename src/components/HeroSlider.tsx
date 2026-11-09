'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  imageUrl: string;
}

interface PromoBannerItem {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  imageUrl?: string | null;
}

interface HeroSliderProps {
  slides?: Slide[];
  promoBanner?: PromoBannerItem | null;
}

export default function HeroSlider({ slides = [], promoBanner }: HeroSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const displaySlides: Slide[] =
    slides.length > 0
      ? slides
      : [
          {
            id: 'default-hero-1',
            buttonUrl: '/shop',
            imageUrl:
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
          },
          {
            id: 'default-hero-2',
            buttonUrl: '/shop',
            imageUrl:
              'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop&q=80',
          },
        ];

  const defaultPromo: PromoBannerItem = promoBanner || {
    buttonUrl: '/shop',
    imageUrl:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
  };

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  const slide = displaySlides[currentIdx] || displaySlides[0];

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIdx((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIdx((prev) => (prev + 1) % displaySlides.length);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-2">
      {/* 2-Column Banner Grid matching Ghorer Bazar Desktop View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column: Main Banner Carousel */}
        <div className="lg:col-span-8 relative w-full aspect-[16/9] lg:aspect-[2.15/1] rounded-2xl overflow-hidden shadow-xs border border-gray-100 bg-gray-50 group">
          <Link href={slide.buttonUrl || '/shop'} className="block w-full h-full relative">
            <Image
              src={slide.imageUrl}
              alt={slide.title || 'Sokher Store Promotion'}
              fill
              priority
              className="object-cover object-center"
            />

            {/* Headline and Offer Badge Overlay (Full Bengali Unicode Text Rendering) */}
            {(slide.title || slide.badge || slide.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent sm:bg-gradient-to-r sm:from-black/70 sm:via-black/25 sm:to-transparent flex items-end sm:items-center p-5 sm:p-8 z-10 pointer-events-none">
                <div className="max-w-md text-white space-y-1.5">
                  {slide.badge && (
                    <span className="inline-block px-2.5 py-1 bg-[#cc272d] text-white text-[11px] font-black rounded-md uppercase tracking-wider shadow-sm">
                      {slide.badge}
                    </span>
                  )}
                  {slide.title && (
                    <h2 className="text-base sm:text-2xl lg:text-3xl font-black text-white leading-snug drop-shadow-md">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 drop-shadow-sm font-medium">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </Link>

          {/* Left Arrow Button */}
          {displaySlides.length > 1 && (
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition active:scale-95 opacity-80 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Right Arrow Button */}
          {displaySlides.length > 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md flex items-center justify-center transition active:scale-95 opacity-80 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Bottom-Left Dots Indicator */}
          {displaySlides.length > 1 && (
            <div className="absolute bottom-3 left-4 flex items-center gap-1.5 z-20">
              {displaySlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIdx
                      ? 'w-5 bg-[#cc272d]'
                      : 'w-2 bg-white/80 hover:bg-white shadow-xs'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Desktop Only): Side Promotional Banner Card */}
        <div className="hidden lg:block lg:col-span-4 relative rounded-2xl overflow-hidden shadow-xs border border-gray-100 bg-gray-50 group">
          <Link href={defaultPromo.buttonUrl || '/shop'} className="block w-full h-full relative min-h-[220px]">
            <Image
              src={defaultPromo.imageUrl || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80'}
              alt={defaultPromo.title || 'Special Promotion'}
              fill
              className="object-cover object-center group-hover:scale-103 transition-transform duration-500"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
