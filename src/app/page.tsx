import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import TrustBar from '@/components/TrustBar';
import CategoryCircles from '@/components/CategoryCircles';
import ProductCard from '@/components/ProductCard';
import PromoBanner from '@/components/PromoBanner';
import FlashSaleSection from '@/components/FlashSaleSection';
import Footer from '@/components/Footer';

export const revalidate = 0; // Dynamic server-rendering for single source of truth

export default async function HomePage() {
  // Fetch everything from Shared Database (Single Source of Truth)
  const [settings, categories, featuredProducts, banners, activeFlashSale] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        subcategories: true,
        productCategories: {
          where: { product: { status: 'ACTIVE' } },
        },
      },
    }),
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: {
        categories: { include: { category: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    prisma.flashSale.findFirst({
      where: {
        isActive: true,
        startTime: { lte: new Date() },
        endTime: { gt: new Date() },
      },
      include: {
        items: {
          include: {
            product: {
              include: { categories: { include: { category: true } } },
            },
          },
        },
      },
    }),
  ]);

  const defaultSettings = settings || {
    storeName: 'Sokher Store',
    tagline: 'Your Beauty, Our Passion',
    logoUrl: '/images/logo-icon.jpg',
    announcementText: 'সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি | ৳৯৯৯ বা তার বেশি অর্ডারে ফ্রি ডেলিভারি!',
    isAnnouncementActive: true,
    freeDeliveryThreshold: 999,
    contactPhone: '+880 1700-000000',
    contactEmail: 'support@sokherstore.com',
    whatsappNumber: '+880 1700-000000',
    trustBarItems: null,
  };

  const heroSlides = banners.filter((b) => b.type === 'HERO_SLIDER');
  const promoBanner = banners.find((b) => b.type === 'PROMO_BANNER');

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c.productCategories.length,
    subcategories: c.subcategories,
  }));

  const formattedFeaturedProducts = featuredProducts.map((p) => {
    const totalRatings = p.reviews.length;
    const avgRating =
      totalRatings > 0
        ? Math.round((p.reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings) * 10) / 10
        : 4.8;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      price: p.price,
      regularPrice: p.regularPrice,
      stock: p.stock,
      badge: p.badge,
      images: JSON.parse(p.images || '[]'),
      rating: avgRating,
      reviewCount: totalRatings > 0 ? totalRatings : 850,
      categories: p.categories.map((c) => c.category),
    };
  });

  return (
    <main className="min-h-screen bg-[#FFFDFD] pb-14 sm:pb-0">
      {/* 1. Announcement Bar (Top Hotline & Free Delivery Notice) */}
      <AnnouncementBar settings={defaultSettings as any} />

      {/* 2. Main 2-Tier Header (Mobile: Top row + Always visible full-width search) */}
      <Header settings={defaultSettings as any} categories={formattedCategories} />

      {/* 3. Compact Banner Slider (On mobile it is compact h-36, doesn't eat screen space) */}
      <HeroSlider slides={heroSlides} />

      {/* 4. Category Section (Immediately follows the compact banner, Ghorer Bazar flow!) */}
      <CategoryCircles categories={formattedCategories} />

      {/* 5. Flash Sale (if active) */}
      {activeFlashSale && <FlashSaleSection flashSale={activeFlashSale} />}

      {/* 6. Products Section (Popular & Featured Products, 2-col on mobile) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-3 sm:mb-6 border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-rose-50 text-[#cc272d] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm sm:text-xl font-black text-gray-950 tracking-tight">
              জনপ্রিয় ও সেরা পণ্যসমূহ
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center text-[11px] sm:text-xs font-bold text-[#cc272d] hover:underline"
          >
            <span>সব পণ্য দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {formattedFeaturedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 text-xs">
            বর্তমানে কোনো পণ্য নেই।
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6">
            {formattedFeaturedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Promotional Banner */}
      <PromoBanner banner={promoBanner} />

      {/* 8. Trust & Assurance Bar (Placed near bottom so it never pushes categories/products away) */}
      <div className="py-6 sm:py-10">
        <TrustBar
          items={
            (defaultSettings as any).trustBarItems
              ? JSON.parse((defaultSettings as any).trustBarItems)
              : null
          }
        />
      </div>

      {/* 9. Footer */}
      <Footer settings={defaultSettings as any} />
    </main>
  );
}
