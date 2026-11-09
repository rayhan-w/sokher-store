'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, Heart, Zap, CheckCircle2 } from 'lucide-react';
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
  const router = useRouter();
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);
  const discountPercent = calculateDiscountPercent(product.price, product.regularPrice);
  const primaryImage =
    product.images?.[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500';
  const categoryName = product.categories?.[0]?.name || 'Cosmetics';

  // 1. Regular Add to Cart (Opens slide-out cart drawer)
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
    setIsCartDrawerOpen(true);
  };

  // 2. Ghorer Bazar Instant "অর্ডার করুন" (1-Click Direct to Checkout)
  const handleDirectOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

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
    router.push('/checkout');
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
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-[#cc272d] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Image Container */}
      <div className="relative w-full aspect-square bg-[#FDFBFB] p-3 flex items-center justify-center overflow-hidden border-b border-gray-100">
        {/* Discount Badge on Top-Left */}
        {discountPercent > 0 ? (
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[11px] font-black bg-[#cc272d] text-white shadow-sm flex items-center gap-1">
            <span>{discountPercent}%</span>
            <span>ছাড়</span>
          </span>
        ) : product.badge ? (
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#cc272d] text-white shadow-sm">
            {product.badge}
          </span>
        ) : null}

        {/* Wishlist Button on Top-Right */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full backdrop-blur-md transition shadow-sm ${
            isFavorite
              ? 'bg-rose-50 text-[#cc272d] border border-red-200'
              : 'bg-white/80 hover:bg-white text-gray-400 hover:text-[#cc272d] border border-gray-100'
          }`}
          aria-label="উইশলিস্ট"
          title="পছন্দের তালিকায় রাখুন"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#cc272d]' : ''}`} />
        </button>

        {/* Product Image with Hover Zoom */}
        <Link
          href={`/product/${product.slug}`}
          className="relative w-full h-full flex items-center justify-center"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2 group-hover:scale-108 transition-transform duration-500"
          />
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Subtle Category */}
          <div className="text-[11px] font-semibold text-gray-400 mb-1 truncate">
            {categoryName}
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#cc272d] transition line-clamp-2 leading-snug min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-gray-700">
              {product.rating || 4.8}
            </span>
            <span className="text-[10px] text-gray-400">
              ({product.reviewCount ? `${product.reviewCount}` : '1.2k'})
            </span>
          </div>

          {/* Price Line (Current Price, Regular Price, Discount Tag) */}
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

        {/* ========================================================= */}
        {/* DUAL ACTION BUTTONS (Ghorer Bazar Signature Conversion)    */}
        {/* ========================================================= */}
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1.5 sm:gap-2">
          {product.stock > 0 ? (
            <>
              {/* Button 1: "অর্ডার করুন" (Instant Checkout) */}
              <button
                type="button"
                onClick={handleDirectOrder}
                className="flex-1 bg-[#cc272d] hover:bg-red-700 active:scale-95 text-white font-bold text-[11px] sm:text-xs md:text-sm py-1.5 sm:py-2 px-1.5 sm:px-2.5 rounded-lg flex items-center justify-center gap-1 shadow-xs transition"
                title="সরাসরি অর্ডার করতে ক্লিক করুন"
              >
                <Zap className="w-3.5 h-3.5 fill-white flex-shrink-0" />
                <span className="truncate">অর্ডার করুন</span>
              </button>

              {/* Button 2: "কার্ট" (Add to Cart Drawer) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="p-1.5 sm:p-2 rounded-lg border-2 border-[#cc272d] text-[#cc272d] hover:bg-rose-50 active:scale-95 transition flex items-center justify-center flex-shrink-0"
                aria-label="কার্টে যোগ করুন"
                title="কার্টে রাখুন"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </>
          ) : (
            <div className="w-full py-1.5 px-2 rounded-lg bg-gray-100 text-gray-400 text-[11px] sm:text-xs font-bold text-center">
              স্টক শেষ (Out of Stock)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
