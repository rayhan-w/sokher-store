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
import FloatingCartTab from '@/components/FloatingCartTab';

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
    announcementText: 'Fast Cash on Delivery all over Bangladesh | Free Shipping on orders over ৳999!',
    isAnnouncementActive: false,
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
      badge: p.badge || 'Best Selling',
      images: JSON.parse(p.images || '[]'),
      rating: avgRating,
      reviewCount: totalRatings > 0 ? totalRatings : 850,
      categories: p.categories.map((c) => c.category),
    };
  });

  return (
    <main className="min-h-screen bg-[#FFFDFD] pb-14 sm:pb-0 relative">
      {/* 1. Announcement Bar (Hidden on Mobile to match screenshot) */}
      <AnnouncementBar settings={defaultSettings as any} />

      {/* 2. Header (Clean mobile view: [☰]  [SOKHER STORE]  [🛒 0]) */}
      <Header settings={defaultSettings as any} categories={formattedCategories} />

      {/* 3. Hero Banner Slider (2-column on desktop with promo card, 16:9 on mobile) */}
      <HeroSlider slides={heroSlides} promoBanner={promoBanner} />

      {/* 4. Featured Categories (Squircle cards with arrow) */}
      <CategoryCircles categories={formattedCategories} />

      {/* 5. Floating Side Cart Tab (Right edge pill) */}
      <FloatingCartTab />

      {/* 6. Flash Sale (if active) */}
      {activeFlashSale && <FlashSaleSection flashSale={activeFlashSale} />}

      {/* 7. Top Selling Products (2-column cards with 🔥 Best Selling badge) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 text-center mb-4 sm:mb-6">
          Top Selling Products
        </h2>

        {formattedFeaturedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-xs">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {formattedFeaturedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-[#cc272d] text-xs font-bold text-gray-700 hover:text-[#cc272d] transition"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 8. Promotional Banner (Mobile only, desktop has it beside hero slider) */}
      <div className="lg:hidden">
        <PromoBanner banner={promoBanner} />
      </div>

      {/* 9. Trust & Assurance Bar */}
      <div className="py-6 sm:py-10">
        <TrustBar
          items={
            (defaultSettings as any).trustBarItems
              ? JSON.parse((defaultSettings as any).trustBarItems)
              : null
          }
        />
      </div>

      {/* 10. Footer */}
      <Footer settings={defaultSettings as any} />
    </main>
  );
}
