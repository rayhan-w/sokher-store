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
  PhoneCall,
  MessageCircle,
  Sparkles,
  AlertCircle,
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
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].name : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Direct On-Page Express Checkout State
  const [directName, setDirectName] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [directAddress, setDirectAddress] = useState('');
  const [directZone, setDirectZone] = useState<'DHAKA' | 'OUTSIDE_DHAKA'>('DHAKA');
  const [directSubmitting, setDirectSubmitting] = useState(false);
  const [directError, setDirectError] = useState('');

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

  const hotline = settings.contactPhone || '+880 1700-000000';
  const whatsapp = settings.whatsappNumber || '+880 1700-000000';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');
  const cleanWa = whatsapp.replace(/[^0-9]/g, '');

  const deliveryCharge =
    directZone === 'DHAKA'
      ? settings.deliveryDhaka ?? 70
      : settings.deliveryOutsideDhaka ?? 130;
  const directTotal = product.price * quantity + deliveryCharge;

  // Add to Cart Drawer
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
    setIsCartDrawerOpen(true);
  };

  // Instant Buy Now
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
      quantity
    );
    router.push('/checkout');
  };

  // Direct On-Page 1-Click Order Submission
  const handleDirectOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDirectError('');

    if (product.stock <= 0) {
      setDirectError('Sorry, this product is currently out of stock.');
      return;
    }

    if (!directName.trim()) {
      setDirectError('Please enter your full name.');
      return;
    }

    if (!directPhone.trim() || !/^01[3-9]\d{8}$/.test(directPhone.trim().replace(/[^0-9]/g, ''))) {
      setDirectError('Please enter a valid 11-digit mobile number (e.g. 01712345678).');
      return;
    }

    if (!directAddress.trim()) {
      setDirectError('Please enter your complete delivery address (House, Road, Area, City).');
      return;
    }

    setDirectSubmitting(true);

    try {
      const payload = {
        customerName: directName.trim(),
        customerPhone: directPhone.trim(),
        shippingAddress: directAddress.trim(),
        deliveryZone: directZone,
        paymentMethod: 'COD',
        orderNotes: 'Quick Direct Order from Product Page',
        items: [
          {
            productId: product.id,
            quantity,
            variant: selectedVariant,
          },
        ],
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setDirectError(data.error || 'Failed to place order. Please try again.');
        setDirectSubmitting(false);
        return;
      }

      router.push(`/order-success/${data.order.orderNumber}`);
    } catch {
      setDirectError('Network error. Please try again.');
      setDirectSubmitting(false);
    }
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
      alert('Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-[#cc272d]">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#cc272d]">
          Shop
        </Link>
        <span>/</span>
        {product.categories?.[0] && (
          <>
            <Link
              href={`/category/${product.categories[0].slug}`}
              className="hover:text-[#cc272d]"
            >
              {product.categories[0].name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="font-bold text-gray-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative w-full aspect-square rounded-2xl bg-[#FDFBFB] border border-gray-200 overflow-hidden p-6 flex items-center justify-center shadow-xs">
            {discountPercent > 0 ? (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md text-xs font-black bg-[#cc272d] text-white shadow-sm flex items-center gap-1">
                <span>{discountPercent}% OFF</span>
              </span>
            ) : product.badge ? (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md text-xs font-bold bg-[#cc272d] text-white shadow-sm">
                {product.badge}
              </span>
            ) : null}

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
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Buying Actions */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* SKU and Views */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span>
                SKU: <strong className="text-gray-800">{product.sku}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gray-500">
                <Eye className="w-3.5 h-3.5" /> {product.viewCount || 120} views
              </span>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200'
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
          <div className="p-4 rounded-xl bg-rose-50/70 border border-red-200 flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-black text-[#cc272d]">
              {formatPrice(product.price)}
            </span>

            {product.regularPrice && product.regularPrice > product.price && (
              <span className="text-sm sm:text-base text-gray-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}

            {discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-md text-xs font-black bg-[#cc272d] text-white">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Stock Availability */}
          <div className="text-xs sm:text-sm font-bold">
            {product.stock > 0 ? (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                In Stock ({product.stock} units available)
              </span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Variants Selector */}
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

          {/* Quantity Selector + Add to Cart + Buy Now */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
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
                className={`p-2.5 rounded-lg border transition ${
                  isFavorite
                    ? 'border-red-200 bg-rose-50 text-[#cc272d]'
                    : 'border-gray-300 text-gray-500 hover:border-[#cc272d]'
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#cc272d]' : ''}`} />
              </button>
            </div>

            {/* High Conversion Dual Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-3.5 px-6 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition active:scale-95 disabled:opacity-40"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Order Now</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-3.5 px-6 rounded-xl border-2 border-[#cc272d] bg-white hover:bg-rose-50 text-[#cc272d] text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          {/* Phone Call to Order Hotline Box */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#cc272d] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <PhoneCall className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Call to Order Directly</p>
                <p className="text-xs text-gray-500">Dial our hotline for instant orders & support</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="px-4 py-2 rounded-lg bg-[#cc272d] text-white font-extrabold text-xs hover:bg-red-700 transition"
              >
                {hotline}
              </a>
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Delivery & Authenticity Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <Truck className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
              <span>Inside Dhaka ৳70, Outside ৳130</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <ShieldCheck className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
              <span>100% Genuine Guaranteed</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <RotateCcw className="w-4 h-4 text-[#cc272d] flex-shrink-0" />
              <span>Easy Return & Refund</span>
            </div>
          </div>
        </div>
      </div>

      {/* Express Checkout Form on Product Page */}
      <section className="bg-rose-50/50 rounded-3xl border-2 border-red-200 p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#cc272d] text-white shadow-sm mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Express 1-Click Order
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950">
              Complete Your Order Below
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Cash on Delivery (Pay after inspecting your parcel)
            </p>
          </div>

          {directError && (
            <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{directError}</span>
            </div>
          )}

          <form onSubmit={handleDirectOrderSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Your Name (Full Name) *
              </label>
              <input
                type="text"
                required
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#cc272d] focus:ring-2 focus:ring-[#cc272d]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Mobile Number (11 digits) *
              </label>
              <input
                type="tel"
                required
                value={directPhone}
                onChange={(e) => setDirectPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#cc272d] focus:ring-2 focus:ring-[#cc272d]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Full Delivery Address (House, Road, Area, City) *
              </label>
              <textarea
                required
                rows={2}
                value={directAddress}
                onChange={(e) => setDirectAddress(e.target.value)}
                placeholder="e.g. House 14, Road 5, Dhanmondi, Dhaka"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#cc272d] focus:ring-2 focus:ring-[#cc272d]/20 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Delivery Area *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDirectZone('DHAKA')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition ${
                    directZone === 'DHAKA'
                      ? 'border-[#cc272d] bg-white text-[#cc272d] shadow-sm'
                      : 'border-gray-200 bg-white/70 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>Inside Dhaka</span>
                  <span className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Charge: {formatPrice(settings.deliveryDhaka ?? 70)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDirectZone('OUTSIDE_DHAKA')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition ${
                    directZone === 'OUTSIDE_DHAKA'
                      ? 'border-[#cc272d] bg-white text-[#cc272d] shadow-sm'
                      : 'border-gray-200 bg-white/70 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>Outside Dhaka</span>
                  <span className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Charge: {formatPrice(settings.deliveryOutsideDhaka ?? 130)}
                  </span>
                </button>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-xl p-4 border border-red-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>
                  Items Price ({quantity} x {formatPrice(product.price)}):
                </span>
                <span className="font-bold text-gray-900">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span className="font-bold text-gray-900">{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-black text-gray-950">
                <span>Total Amount:</span>
                <span className="text-[#cc272d]">{formatPrice(directTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={directSubmitting || product.stock <= 0}
              className="w-full py-4 px-6 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white text-base font-black flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition active:scale-95 disabled:opacity-40"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>
                {directSubmitting ? 'Placing Order...' : 'Confirm Order (Cash on Delivery)'}
              </span>
            </button>
          </form>
        </div>
      </section>

      {/* Product Tabs: Description / Specifications / Customer Reviews */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-sm sm:text-base font-bold pb-2 transition relative ${
              activeTab === 'desc' ? 'text-[#cc272d]' : 'text-gray-500 hover:text-gray-900'
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
                activeTab === 'specs' ? 'text-[#cc272d]' : 'text-gray-500 hover:text-gray-900'
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
              activeTab === 'reviews' ? 'text-[#cc272d]' : 'text-gray-500 hover:text-gray-900'
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
            <div className="prose prose-rose max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description || 'Detailed description for this product will be available soon.'}
            </div>
          )}

          {activeTab === 'specs' && product.specification && (
            <div className="text-xs sm:text-sm text-gray-700 space-y-2">
              <pre className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-sans whitespace-pre-wrap">
                {product.specification}
              </pre>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Reviews List */}
              {reviewsList.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviewsList.map((rev: any) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{rev.customerName}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              <form
                onSubmit={handleReviewSubmit}
                className="pt-6 border-t border-gray-100 space-y-4 max-w-xl"
              >
                <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                  Write a Customer Review
                </h4>

                {reviewSuccess && (
                  <p className="text-xs text-emerald-600 font-bold">
                    Thank you! Your review has been submitted successfully.
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-4 h-4 ${
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
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#cc272d]"
                  />
                </div>

                <div>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#cc272d] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-lg sm:text-xl font-black text-gray-900">Related Products</h3>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#cc272d] hover:underline"
            >
              View More →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
