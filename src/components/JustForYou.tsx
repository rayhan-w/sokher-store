'use client';

import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

interface JustForYouProps {
  initialProducts: any[];
}

export default function JustForYou({ initialProducts }: JustForYouProps) {
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/products?page=${nextPage}&limit=10`);
      const data = await res.json();

      if (data?.products && data.products.length > 0) {
        setProducts((prev) => [...prev, ...data.products]);
        setPage(nextPage);
        if (data.products.length < 10) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      <h2 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight text-center mb-5 sm:mb-7">
        Just For You
      </h2>

      {/* 5x2 Product Grid on Desktop (5 per row), 2 cols on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Outlined "LOAD MORE" button (Red outline) */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border-2 border-[#cc272d] text-[#cc272d] hover:bg-rose-50 active:scale-95 text-xs sm:text-sm font-bold tracking-wider uppercase transition shadow-2xs disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#cc272d]" />}
            <span>{loading ? 'Loading...' : 'LOAD MORE'}</span>
          </button>
        </div>
      )}
    </section>
  );
}
