'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  const slide = displaySlides[currentIdx] || displaySlides[0];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-2.5 pb-2">
      {/* Exact Match to User Screenshot: aspect-[16/9] Image Banner Card */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] md:aspect-[3/1] rounded-2xl overflow-hidden shadow-xs border border-gray-100 bg-gray-50">
        <Link href={slide.buttonUrl || '/shop'} className="block w-full h-full relative">
          <Image
            src={slide.imageUrl}
            alt={slide.title || 'Sokher Store Promotion'}
            fill
            priority
            className="object-cover object-center"
          />
        </Link>

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
    </section>
  );
}
