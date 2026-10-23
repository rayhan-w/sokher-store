'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface PromoBannerProps {
  banner?: {
    title?: string | null;
    subtitle?: string | null;
    badge?: string | null;
    buttonText?: string | null;
    buttonUrl?: string | null;
    imageUrl?: string | null;
  } | null;
}

export default function PromoBanner({ banner }: PromoBannerProps) {
  const title = banner?.title || 'Glow Naturally';
  const subtitle = banner?.subtitle || 'Healthy skin. Happy you.';
  const badge = banner?.badge || 'SKINCARE SPECIAL';
  const buttonText = banner?.buttonText || 'Shop Skincare';
  const buttonUrl = banner?.buttonUrl || '/category/skincare';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-100 via-[#FDE2E4] to-rose-200 border border-rose-200/60 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center min-h-[220px] p-6 sm:p-10 gap-6">
          {/* Left Model Photo */}
          <div className="md:col-span-4 relative flex items-center justify-center">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
              <Image
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80"
                alt="Natural Skincare Model"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Center Call to Action */}
          <div className="md:col-span-5 text-center md:text-left space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#cc272d] uppercase">
              {badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {subtitle}
            </p>
            <div className="pt-2">
              <Link
                href={buttonUrl}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#cc272d] text-white text-xs sm:text-sm font-semibold shadow-md hover:bg-red-700 transition"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Cosmetics Jar Mockup */}
          <div className="md:col-span-3 hidden md:flex items-center justify-center">
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white p-2 shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80"
                alt="Skincare Cream"
                fill
                className="object-contain p-2"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
