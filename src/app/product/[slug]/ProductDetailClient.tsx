'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  PhoneCall,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  UploadCloud,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
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

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].name : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  // Review submission state
  const [reviewsList, setReviewsList] = useState<any[]>(product.reviews || []);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const images: string[] =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'];

  const discountPercent = calculateDiscountPercent(product.price, product.regularPrice);

  const hotline = settings.contactPhone || '+880 1700-000000';
  const whatsapp = settings.whatsappNumber || '+880 1700-000000';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');
  const cleanWa = whatsapp.replace(/[^0-9]/g, '');

  // Extract Brand from specification
  let brandName: string | null = null;
  if (product.specification) {
    try {
      const parsed =
        typeof product.specification === 'string'
          ? JSON.parse(product.specification)
          : product.specification;
      if (typeof parsed === 'object' && parsed !== null) {
        brandName = parsed.Brand || parsed.brand || null;
      }
    } catch {
      // If plain string mentions Brand:
      const match = product.specification.match(/brand:\s*([^\n\r]+)/i);
      if (match) brandName = match[1].trim();
    }
  }

  const BRAND_LOGOS: Record<string, string> = {
    "pond's": '/images/brands/ponds.svg',
    "ponds": '/images/brands/ponds.svg',
    "maybelline": '/images/brands/maybelline.svg',
    "maybelline new york": '/images/brands/maybelline.svg',
    "l'oréal paris": '/images/brands/loreal.svg',
    "l'oreal paris": '/images/brands/loreal.svg',
    "l'oréal": '/images/brands/loreal.svg',
    "l'oreal": '/images/brands/loreal.svg',
    "lakmé": '/images/brands/lakme.svg',
    "lakme": '/images/brands/lakme.svg',
    "simple": '/images/brands/simple.svg',
  };
  const brandKey = brandName ? brandName.toLowerCase().trim() : '';
  const brandLogo = brandKey ? BRAND_LOGOS[brandKey] : null;

  // Calculate review metrics
  const totalReviews = reviewsList.length;
  const avgRating =
    totalReviews > 0
      ? Math.round(
          (reviewsList.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) /
            totalReviews) *
            10
        ) / 10
      : 5.0;

  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewsList.filter((r: any) => Math.round(r.rating || 5) === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  const recommendedPercent =
    totalReviews > 0
      ? Math.round(
          (reviewsList.filter((r: any) => (r.rating || 5) >= 4).length / totalReviews) * 100
        )
      : 100;

  // 1. Add to Cart (Toast + badge update, does NOT open drawer)
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
      quantity,
      false
    );
  };

  // 2. Buy Now (Adds to cart & navigates to checkout)
  const handleBuyNow = () => {
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
      quantity,
      false
    );
    router.push('/checkout');
  };

  // Image Upload for Reviews (max 3 images)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (reviewImages.length + files.length > 3) {
      alert('You can upload a maximum of 3 images for a review.');
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setReviewImages((prev) => [...prev, uploadEvent.target!.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReviewImage = (idx: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== idx));
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
          customerName: reviewerName.trim() || 'Verified Customer',
          rating: reviewRating,
          comment: reviewComment.trim(),
          images: reviewImages,
        }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviewsList([data.review, ...reviewsList]);
        setReviewComment('');
        setReviewerName('');
        setReviewImages([]);
        setReviewSuccess(true);
      }
    } catch {
      alert('Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const prevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="space-y-12">
      {/* 1. Shortened Breadcrumb: Home > Products */}
      <nav className="text-xs text-gray-500 flex items-center gap-2">
        <Link href="/" className="hover:text-[#cc272d] transition">
          Home
        </Link>
        <span>&gt;</span>
        <Link href="/shop" className="hover:text-[#cc272d] transition">
          Products
        </Link>
        {product.name && (
          <>
            <span>&gt;</span>
            <span className="font-semibold text-gray-900 truncate max-w-xs">{product.name}</span>
          </>
        )}
      </nav>

      {/* 2. Main Top Grid: Vertical Gallery on Left + Buy Box on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Gallery: Vertical Thumbnails on LEFT + Main Image */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
          {/* Vertical Thumbnails Column (Left of Main Image) */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[460px] no-scrollbar flex-shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 border-2 transition flex-shrink-0 ${
                    idx === activeImageIdx
                      ? 'border-[#cc272d] shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`View thumbnail ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image with Prev/Next Arrows and Slide Counter ("1 / 4") */}
          <div className="relative flex-1 w-full aspect-square rounded-2xl bg-[#FDFBFB] border border-gray-100 overflow-hidden p-6 flex items-center justify-center shadow-xs group">
            <Image
              src={images[activeImageIdx] || images[0]}
              alt={product.name}
              fill
              priority
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />

            {/* Prev Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition active:scale-95 opacity-80 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Next Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center transition active:scale-95 opacity-80 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Slide Counter (e.g. "1 / 4") */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/65 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs select-none">
                {activeImageIdx + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* Buy Box (Exact Reference Order: H1 -> Price Row -> Variant -> Quantity -> Buttons) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. H1 Product Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 tracking-tight leading-snug">
            {product.name}
          </h1>

          {/* 2. Price Row (Inline on White background — REMOVED pink/red tinted box) */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-black text-[#cc272d]">
              {formatPrice(product.price)}
            </span>

            {product.regularPrice && product.regularPrice > product.price && (
              <span className="text-base text-gray-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}

            {discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-md text-xs font-black bg-[#cc272d] text-white shadow-2xs">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* 3. Cosmetics Shade / Variant Selector (Preserved) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Select Shade / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariant(v.name)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition ${
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

          {/* 4. "Quantity:" Stepper */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-bold text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-gray-100 text-gray-700 transition"
                aria-label="Decrease"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="p-2 hover:bg-gray-100 text-gray-700 transition disabled:opacity-40"
                aria-label="Increase"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 5. Buttons Stack */}
          <div className="space-y-3 pt-2">
            {/* Row 1: Solid Red "ADD TO CART" (bag icon) + Solid Black "BUY NOW" */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-3.5 px-4 rounded-xl bg-[#cc272d] hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition disabled:opacity-40 uppercase tracking-wider"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO CART</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-3.5 px-4 rounded-xl bg-[#18181b] hover:bg-black active:scale-95 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition disabled:opacity-40 uppercase tracking-wider"
              >
                <span>BUY NOW</span>
              </button>
            </div>

            {/* Row 2: Green "Order On WhatsApp" + Black "Call For Order" */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${cleanWa}?text=Hello%20Sokher%20Store%2C%20I%20want%20to%20order%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                <span className="truncate">Order On WhatsApp</span>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="w-full py-3 px-4 rounded-xl bg-[#18181b] hover:bg-black active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span className="truncate">Call For Order</span>
              </a>
            </div>
          </div>

          {/* Bordered "Brand: <brand name>" Chip with Logo (Hidden if product has no brand) */}
          {brandName && (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold text-gray-800 shadow-2xs">
                <span className="text-gray-500 font-semibold">Brand:</span>
                {brandLogo && (
                  <div className="relative w-14 h-4 flex items-center">
                    <Image
                      src={brandLogo}
                      alt={brandName}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <span className="text-[#cc272d]">{brandName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Exactly TWO Tabs: "Description" and "Customer Reviews (N)" */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-8 border-b border-gray-100 pb-4">
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-sm sm:text-base font-bold pb-2 transition relative ${
              activeTab === 'desc' ? 'text-[#cc272d]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Description
            {activeTab === 'desc' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc272d] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm sm:text-base font-bold pb-2 transition relative ${
              activeTab === 'reviews' ? 'text-[#cc272d]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Customer Reviews ({reviewsList.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc272d] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Description with formatted subheadings */}
        {activeTab === 'desc' && (
          <div className="pt-6 prose prose-rose max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description ||
              'Authentic cosmetics and beauty care item. 100% genuine guaranteed.'}
          </div>
        )}

        {/* Tab 2: Reviews (Summary block + reviews list + Submit review form with image upload) */}
        {activeTab === 'reviews' && (
          <div className="pt-6 space-y-10">
            {/* Reference Review Summary Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100 items-center">
              {/* Average Rating Number & Stars */}
              <div className="text-center md:border-r border-gray-200 pr-4">
                <div className="text-4xl sm:text-5xl font-black text-gray-950">
                  {avgRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(avgRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 font-medium">Based on {totalReviews} reviews</p>
              </div>

              {/* % Recommended */}
              <div className="text-center md:border-r border-gray-200 px-4">
                <div className="text-3xl sm:text-4xl font-black text-[#cc272d]">
                  {recommendedPercent}%
                </div>
                <p className="text-xs text-gray-700 font-bold mt-1">Recommended</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  of customers recommend this product
                </p>
              </div>

              {/* Star-distribution bars */}
              <div className="space-y-1.5 pl-2">
                {starCounts.map((s) => (
                  <div key={s.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-10 text-gray-600 font-semibold">{s.stars} Star</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] text-gray-400 font-bold">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            {reviewsList.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500 italic">
                No customer reviews yet. Be the first to review this product!
              </p>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev: any) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {rev.customerName || 'Verified Customer'}
                        </span>
                        {rev.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (rev.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {rev.comment}
                    </p>

                    {rev.images && rev.images.length > 0 && (
                      <div className="flex items-center gap-2 pt-2">
                        {rev.images.map((img: string, i: number) => (
                          <div
                            key={i}
                            className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-200"
                          >
                            <Image
                              src={img}
                              alt={`Customer photo ${i + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* "Submit Your Review" Form */}
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4">Submit Your Review</h3>

              {reviewSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Thank you! Your review has been submitted successfully.</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Your Rating *</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
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
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Nusrat Jahan"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#cc272d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your honest opinion about this product..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#cc272d] resize-none"
                  />
                </div>

                {/* Optional Image Upload (Max 3) */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Attach Photos (Optional, max 3)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 flex items-center gap-2 transition">
                      <UploadCloud className="w-4 h-4 text-gray-500" />
                      <span>Upload Images</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {reviewImages.length > 0 && (
                    <div className="flex items-center gap-3 mt-3">
                      {reviewImages.map((img, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group"
                        >
                          <Image src={img} alt="Preview" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removeReviewImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition active:scale-95 disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 4. Related Products (Up to 12 products with "More Products →" link) */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="pt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">
              Related Products
            </h2>
            {product.primaryCategory && (
              <Link
                href={`/category/${product.primaryCategory.slug}`}
                className="text-xs sm:text-sm font-bold text-[#cc272d] hover:underline flex items-center gap-1"
              >
                <span>More Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedProducts.slice(0, 12).map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
