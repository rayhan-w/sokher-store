'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { calculateDiscountPercent, formatPrice } from '@/lib/price-parser';
import ProductCard from '@/components/ProductCard';

interface ProductDetailClientProps {
  product: any;
  relatedProducts: any[];
  settings: any;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  settings,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].name : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Review submission state
  const [reviewsList, setReviewsList] = useState(product.reviews || []);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const images: string[] =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'];

  const discountPercent = calculateDiscountPercent(product.price, product.regularPrice);
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        regularPrice: product.regularPrice,
        image: images[0],
        sku: product.sku,
        variant: selectedVariant,
        stock: product.stock,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewerName.trim() || 'Anonymous Customer',
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviewsList([data.review, ...reviewsList]);
        setReviewComment('');
        setReviewerName('');
        setReviewSuccess(true);
      }
    } catch {
      alert('রিভিউ জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 flex items-center gap-2">
        <Link href="/" className="hover:text-[#cc272d]">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#cc272d]">Shop</Link>
        <span>/</span>
        {product.categories?.[0] && (
          <>
            <Link href={`/shop?category=${product.categories[0].slug}`} className="hover:text-[#cc272d]">
              {product.categories[0].name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="font-semibold text-gray-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative w-full aspect-square rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden p-6 flex items-center justify-center shadow-xs">
            {product.badge && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold bg-[#cc272d] text-white shadow-sm">
                {product.badge}
              </span>
            )}
            <Image
              src={images[activeImageIdx] || images[0]}
              alt={product.name}
              fill
              priority
              className="object-contain p-4 hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border-2 transition flex-shrink-0 ${
                    idx === activeImageIdx
                      ? 'border-[#cc272d] shadow-sm'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Buying Actions */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* SKU and Views */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span>SKU: <strong className="text-gray-800">{product.sku}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gray-500">
                <Eye className="w-3.5 h-3.5" /> {product.viewCount || 1} views
              </span>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                {product.rating || 4.8}
              </span>
              <span className="text-xs text-gray-400">
                ({product.reviewCount || reviewsList.length} customer reviews)
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-black text-[#cc272d]">
              {formatPrice(product.price)}
            </span>

            {product.regularPrice && product.regularPrice > product.price && (
              <span className="text-sm sm:text-base text-gray-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}

            {discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#cc272d] text-white">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Stock Availability */}
          <div className="text-xs sm:text-sm font-semibold">
            {product.stock > 0 ? (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                In Stock ({product.stock} units available)
              </span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Variants Selector (Shade / Size) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Select Shade / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariant(v.name)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                      selectedVariant === v.name
                        ? 'border-[#cc272d] bg-rose-50 text-[#cc272d] shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector + Add to Cart + Buy Now */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-gray-100 text-gray-700 transition"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="p-2.5 hover:bg-gray-100 text-gray-700 transition disabled:opacity-40"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() =>
                  toggleWishlist({
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    regularPrice: product.regularPrice,
                    image: images[0],
                    badge: product.badge,
                  })
                }
                className={`p-3 rounded-xl border transition ${
                  isFavorite
                    ? 'border-red-200 bg-rose-50 text-[#cc272d]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                aria-label="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#cc272d]' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-3.5 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-3.5 px-6 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-red-500/25 transition disabled:opacity-40"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Delivery & Authenticity Guarantee (Single Source of Truth) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <Truck className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
              <span>Free Delivery over ৳{settings.freeDeliveryThreshold ?? 999}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <ShieldCheck className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
              <span>100% Genuine Guaranteed</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <RotateCcw className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
              <span>Easy Return & Refund</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs: Description / Specifications / Customer Reviews */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-6 border-b border-gray-100 pb-4">
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-sm sm:text-base font-bold pb-2 transition relative ${
              activeTab === 'desc'
                ? 'text-[#cc272d]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Product Description
            {activeTab === 'desc' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc272d] rounded-full" />
            )}
          </button>

          {product.specification && (
            <button
              onClick={() => setActiveTab('specs')}
              className={`text-sm sm:text-base font-bold pb-2 transition relative ${
                activeTab === 'specs'
                  ? 'text-[#cc272d]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Specifications
              {activeTab === 'specs' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc272d] rounded-full" />
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm sm:text-base font-bold pb-2 transition relative ${
              activeTab === 'reviews'
                ? 'text-[#cc272d]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Reviews ({reviewsList.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc272d] rounded-full" />
            )}
          </button>
        </div>

        <div className="pt-6">
          {activeTab === 'desc' && (
            <div className="prose prose-rose max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.description || 'এই পণ্যটির কোনো বিস্তারিত বর্ণনা দেওয়া হয়নি।'}
            </div>
          )}

          {activeTab === 'specs' && product.specification && (
            <div className="max-w-2xl">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <tbody>
                  {Object.entries(product.specification).map(([key, val]: any, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-none">
                      <td className="py-2.5 font-bold text-gray-700 w-1/3">{key}</td>
                      <td className="py-2.5 text-gray-600">{String(val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">এখনো কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনি দিন!</p>
                ) : (
                  reviewsList.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-2xl bg-gray-50/60 border border-gray-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{r.customerName}</span>
                          {r.isVerified && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {new Date(r.createdAt || Date.now()).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-700">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Write a Review */}
              <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/30 max-w-xl">
                <h4 className="text-sm font-bold text-gray-900 mb-3">আপনার মূল্যবান মতামত দিন</h4>

                {reviewSuccess && (
                  <div className="p-3 mb-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                    ধন্যবাদ! আপনার রিভিউটি সফলভাবে জমা হয়েছে।
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">রেটিং নির্বাচন করুন:</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="আপনার নাম (ঐচ্ছিক)"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder="পণ্যটি কেমন লাগলো লিখুন..."
                      rows={3}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting || !reviewComment.trim()}
                    className="py-2 px-5 bg-[#cc272d] hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition disabled:opacity-40"
                  >
                    {reviewSubmitting ? 'জমা হচ্ছে...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Related Products</h2>
            <Link
              href="/shop"
              className="text-xs sm:text-sm font-semibold text-[#cc272d] hover:underline"
            >
              View More →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
