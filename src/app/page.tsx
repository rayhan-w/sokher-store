import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
      take: 10,
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
    announcementText: 'Free Shipping on orders over ৳999 | 100% Authentic Products',
    isAnnouncementActive: true,
    freeDeliveryThreshold: 999,
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
    const avgRating = totalRatings > 0
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
    <main className="min-h-screen bg-[#FFFDFD]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar settings={defaultSettings} />

      {/* 2. Main Header */}
      <Header settings={defaultSettings} categories={formattedCategories} />

      {/* 3. Hero Slider */}
      <HeroSlider slides={heroSlides} />

      {/* 4. Trust Bar */}
      <TrustBar items={(defaultSettings as any).trustBarItems ? JSON.parse((defaultSettings as any).trustBarItems) : null} />

      {/* 5. Shop by Category */}
      <CategoryCircles categories={formattedCategories} />

      {/* 6. Featured Products (Reference UI Match) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Best selling products just for you
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#cc272d] hover:text-red-700 hover:underline"
          >
            View All Products
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {formattedFeaturedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
            বর্তমানে কোনো ফিচারড পণ্য নেই।
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {formattedFeaturedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Flash Sale (if active) */}
      {activeFlashSale && <FlashSaleSection flashSale={activeFlashSale} />}

      {/* 8. Promotional Banner ("Glow Naturally") */}
      <PromoBanner banner={promoBanner} />

      {/* 9. Footer */}
      <Footer settings={defaultSettings as any} />
    </main>
  );
}
