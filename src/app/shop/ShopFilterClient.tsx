'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Check, ChevronDown } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  subcategories: Array<{ id: string; name: string; slug: string }>;
}

interface ShopFilterClientProps {
  categories: CategoryItem[];
  currentCategory?: string;
  currentSubcategory?: string;
}

export default function ShopFilterClient({
  categories,
  currentCategory,
  currentSubcategory,
}: ShopFilterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');

    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    router.push(`/shop?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push('/shop');
  };

  const activeCategory = categories.find((c) => c.slug === currentCategory);

  const filterContent = (
    <div className="space-y-6">
      {/* Category List */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
        <ul className="space-y-1.5 text-xs">
          <li>
            <Link
              href="/shop"
              className={`flex items-center justify-between py-1 px-2 rounded-lg transition ${
                !currentCategory ? 'bg-rose-50 text-[#cc272d] font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>All Categories</span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/shop?category=${cat.slug}`}
                className={`flex items-center justify-between py-1 px-2 rounded-lg transition ${
                  currentCategory === cat.slug
                    ? 'bg-rose-50 text-[#cc272d] font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-semibold">
                  {cat.productCount}
                </span>
              </Link>

              {/* Subcategories if category is selected */}
              {currentCategory === cat.slug && cat.subcategories && cat.subcategories.length > 0 && (
                <ul className="pl-4 mt-1 space-y-1 border-l-2 border-rose-100">
                  {cat.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                        className={`block py-0.5 text-[11px] transition ${
                          currentSubcategory === sub.slug
                            ? 'text-[#cc272d] font-bold'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        • {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range Filter */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Price Range (৳)</h3>
        <form onSubmit={handlePriceApply} className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-[#cc272d] hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
          >
            Apply Price Filter
          </button>
        </form>
      </div>

      {/* Badges / Special Filters */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Popular Badges</h3>
        <div className="flex flex-wrap gap-1.5">
          {['Best Seller', 'New', 'Hot'].map((b) => (
            <Link
              key={b}
              href={`/shop?badge=${encodeURIComponent(b)}`}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-[#cc272d] transition"
            >
              {b}
            </Link>
          ))}
        </div>
      </div>

      {/* Reset Filter Button */}
      {(currentCategory || currentSubcategory || minPrice || maxPrice) && (
        <div className="pt-2">
          <button
            onClick={handleClearFilters}
            className="w-full py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm"
        >
          <Filter className="w-4 h-4 text-[#cc272d]" />
          <span>Filters & Categories</span>
        </button>

        {isOpenMobile && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-3 shadow-lg">
            {filterContent}
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {filterContent}
      </div>
    </>
  );
}
