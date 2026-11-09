'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ShopFilterClientProps {
  isCategoryPage?: boolean;
  subcategories?: SubcategoryItem[];
  maxPossiblePrice?: number;
  availableBrands?: string[];
  basePath?: string;
}

export default function ShopFilterClient({
  isCategoryPage = false,
  subcategories = [],
  maxPossiblePrice = 5000,
  availableBrands = [],
  basePath = '/shop',
}: ShopFilterClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Selected filters from searchParams
  const selectedFlags = searchParams.getAll('flag');
  const selectedSubs = searchParams.getAll('sub');
  const selectedBrands = searchParams.getAll('brand');
  const initialMaxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : maxPossiblePrice;

  const [priceLimit, setPriceLimit] = useState(initialMaxPrice);

  useEffect(() => {
    if (searchParams.get('maxPrice')) {
      setPriceLimit(Number(searchParams.get('maxPrice')));
    } else {
      setPriceLimit(maxPossiblePrice);
    }
  }, [searchParams, maxPossiblePrice]);

  const updateFilters = (newParams: URLSearchParams) => {
    newParams.set('page', '1'); // Reset to page 1 on filter change
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleFlagToggle = (flagValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll('flag');
    params.delete('flag');

    if (current.includes(flagValue)) {
      current.filter((f) => f !== flagValue).forEach((f) => params.append('flag', f));
    } else {
      [...current, flagValue].forEach((f) => params.append('flag', f));
    }
    updateFilters(params);
  };

  const handleSubcategoryToggle = (subSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll('sub');
    params.delete('sub');

    if (current.includes(subSlug)) {
      current.filter((s) => s !== subSlug).forEach((s) => params.append('sub', s));
    } else {
      [...current, subSlug].forEach((s) => params.append('sub', s));
    }
    updateFilters(params);
  };

  const handleBrandToggle = (brandName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll('brand');
    params.delete('brand');

    if (current.includes(brandName)) {
      current.filter((b) => b !== brandName).forEach((b) => params.append('brand', b));
    } else {
      [...current, brandName].forEach((b) => params.append('brand', b));
    }
    updateFilters(params);
  };

  const handlePriceChange = (val: number) => {
    setPriceLimit(val);
  };

  const handlePriceCommit = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('maxPrice', priceLimit.toString());
    updateFilters(params);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 shadow-xs select-none">
      {/* 1. Category Page ONLY: "FILTER BY CATEGORY" (Sub-category checkboxes) */}
      {isCategoryPage && subcategories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
            FILTER BY CATEGORY
          </h3>
          <div className="space-y-2">
            {subcategories.map((sub) => {
              const checked = selectedSubs.includes(sub.slug);
              return (
                <label
                  key={sub.id}
                  className="flex items-center gap-2.5 text-xs text-gray-700 hover:text-[#cc272d] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSubcategoryToggle(sub.slug)}
                    className="w-4 h-4 rounded text-[#cc272d] focus:ring-[#cc272d] border-gray-300"
                  />
                  <span>{sub.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. PRODUCT FLAG Checkboxes (Best Selling, New Arrival) */}
      <div className={`space-y-3 ${isCategoryPage ? 'border-t border-gray-100 pt-5' : ''}`}>
        <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
          PRODUCT FLAG
        </h3>
        <div className="space-y-2">
          {['Best Selling', 'New Arrival'].map((flag) => {
            const checked = selectedFlags.includes(flag);
            return (
              <label
                key={flag}
                className="flex items-center gap-2.5 text-xs text-gray-700 hover:text-[#cc272d] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleFlagToggle(flag)}
                  className="w-4 h-4 rounded text-[#cc272d] focus:ring-[#cc272d] border-gray-300"
                />
                <span>{flag}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. PRICE RANGE Live Slider with ৳ min/max labels */}
      <div className="border-t border-gray-100 pt-5 space-y-3">
        <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
          PRICE RANGE
        </h3>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={maxPossiblePrice}
            step={50}
            value={priceLimit}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
            onMouseUp={handlePriceCommit}
            onTouchEnd={handlePriceCommit}
            className="w-full accent-[#cc272d] cursor-pointer"
          />
          <div className="flex items-center justify-between text-xs font-bold text-gray-700">
            <span>৳0</span>
            <span className="text-[#cc272d]">৳{priceLimit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 4. BRANDS Checkboxes */}
      {availableBrands.length > 0 && (
        <div className="border-t border-gray-100 pt-5 space-y-3">
          <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider">
            BRANDS
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {availableBrands.map((brand) => {
              const checked = selectedBrands.includes(brand);
              return (
                <label
                  key={brand}
                  className="flex items-center gap-2.5 text-xs text-gray-700 hover:text-[#cc272d] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleBrandToggle(brand)}
                    className="w-4 h-4 rounded text-[#cc272d] focus:ring-[#cc272d] border-gray-300"
                  />
                  <span>{brand}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
