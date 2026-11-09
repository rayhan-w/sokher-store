'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandItem {
  name: string;
  logo?: string | null;
  slug?: string;
}

interface BrandRowProps {
  brands?: BrandItem[];
}

export default function BrandRow({ brands = [] }: BrandRowProps) {
  // Rule: Hide section completely if no brand has a logo (never hardcode fake logos)
  const validBrands = brands.filter((b) => Boolean(b.logo && b.logo.trim()));

  if (validBrands.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">
          Our Brands
        </h2>
        <Link
          href="/shop"
          className="text-xs sm:text-sm font-bold text-[#cc272d] hover:underline"
        >
          SEE ALL →
        </Link>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
        {validBrands.map((b, idx) => (
          <Link
            key={idx}
            href={`/shop?search=${encodeURIComponent(b.name)}`}
            className="flex-shrink-0 w-28 sm:w-36 h-16 sm:h-20 bg-white rounded-xl border border-gray-100 shadow-2xs hover:border-[#cc272d] hover:shadow-sm p-3 flex items-center justify-center transition group"
            title={b.name}
          >
            <div className="relative w-full h-full">
              <Image
                src={b.logo!}
                alt={b.name}
                fill
                className="object-contain filter grayscale group-hover:grayscale-0 transition duration-300"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
