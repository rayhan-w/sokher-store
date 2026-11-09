'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { calculateDiscountPercent, formatPrice } from '@/lib/price-parser';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    regularPrice?: number | null;
    stock: number;
    badge?: string | null;
    images?: string[];
    isFeatured?: boolean;
    categories?: Array<{ name: string; slug: string }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, removeFromCart, isInCart } = useCart();

  const inCart = isInCart(product.id);
  const discountPercent = calculateDiscountPercent(product.price, product.regularPrice);
  const primaryImage =
    product.images?.[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500';

  const isNewArrival =
    product.badge === 'New Arrival' ||
    product.badge === 'New' ||
    product.badge === 'NEW_ARRIVAL';

  const isBestSelling =
    product.badge === 'Best Selling' ||
    product.badge === 'Best Seller' ||
    product.badge === 'BEST_SELLER' ||
    product.badge === 'HOT';

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCart) {
      removeFromCart(product.id);
    } else {
      addToCart(
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          regularPrice: product.regularPrice,
          image: primaryImage,
          sku: product.sku,
          stock: product.stock,
        },
        1,
        false // Do NOT auto-open drawer, per reference pattern
      );
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-[#cc272d] hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Image Container */}
      <div className="relative w-full aspect-square bg-[#FDFBFB] p-3 flex items-center justify-center overflow-hidden">
        {/* Badges on TOP-LEFT of Image as Text Pills */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#cc272d] text-white shadow-xs">
              Save {discountPercent}%
            </span>
          )}
          {isNewArrival && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#18181b] text-white shadow-xs">
              New Arrival
            </span>
          )}
          {isBestSelling && !isNewArrival && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#cc272d] text-white shadow-xs">
              Best Selling
            </span>
          )}
        </div>

        {/* Product Image */}
        <Link
          href={`/product/${product.slug}`}
          className="relative w-full h-full flex items-center justify-center"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 group-hover:scale-106 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Product Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name (2 lines max) */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#cc272d] transition line-clamp-2 leading-snug min-h-[2.4rem]">
              {product.name}
            </h3>
          </Link>

          {/* Price Row: Bold Red Current Price + Grey Strikethrough Regular Price */}
          <div className="flex items-baseline gap-2 mt-2 flex-wrap">
            <span className="text-sm sm:text-base font-black text-[#cc272d]">
              {formatPrice(product.price)}
            </span>

            {product.regularPrice && product.regularPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>
        </div>

        {/* ONE button only, full-width at the card foot */}
        <div className="mt-3 pt-2">
          {product.stock <= 0 ? (
            <div className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold text-center">
              Out of Stock
            </div>
          ) : inCart ? (
            <button
              type="button"
              onClick={handleCartClick}
              className="w-full bg-[#cc272d] hover:bg-red-700 text-white font-bold text-xs sm:text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
              title="Remove from Cart"
            >
              <Check className="w-4 h-4" />
              <span>Remove from Cart</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCartClick}
              className="w-full bg-white hover:bg-rose-50 border border-[#cc272d] text-[#cc272d] font-bold text-xs sm:text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
