'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
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
    rating?: number;
    reviewCount?: number;
    categories?: Array<{ name: string; slug: string }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);
  const discountPercent = calculateDiscountPercent(product.price, product.regularPrice);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      regularPrice: product.regularPrice,
      image: primaryImage,
      sku: product.sku,
      stock: product.stock,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      regularPrice: product.regularPrice,
      image: primaryImage,
      badge: product.badge,
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100/90 hover:border-rose-200 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Container */}
      <div className="relative w-full aspect-square bg-[#FAFAFA] p-4 flex items-center justify-center overflow-hidden">
        {/* Badge (e.g. Best Seller, New, Hot) */}
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#cc272d] text-white shadow-sm">
            {product.badge}
          </span>
        )}

        {/* Product Image with Hover Zoom */}
        <Link href={`/product/${product.slug}`} className="relative w-full h-full flex items-center justify-center">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#cc272d] transition line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-gray-800">
              {product.rating || 4.8}
            </span>
            <span className="text-xs text-gray-400">
              ({product.reviewCount ? `${product.reviewCount}` : '1.2k'})
            </span>
          </div>

          {/* Price, Regular Price, Discount % */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-[#cc272d]">
              {formatPrice(product.price)}
            </span>

            {product.regularPrice && product.regularPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}

            {discountPercent > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#cc272d] text-white">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Add to Cart + Wishlist Heart */}
        <div className="flex items-center gap-2 mt-4 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold text-white transition shadow-sm ${
              product.stock > 0
                ? 'bg-[#cc272d] hover:bg-red-700 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>

          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-lg border transition ${
              isFavorite
                ? 'border-red-200 bg-rose-50 text-[#cc272d]'
                : 'border-gray-200 hover:border-rose-200 hover:text-[#cc272d] text-gray-400'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#cc272d]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
