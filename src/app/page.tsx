import React from 'react';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import CategoryCircles from '@/components/CategoryCircles';
import ProductCarousel from '@/components/ProductCarousel';
import BrandRow from '@/components/BrandRow';
import PromoBanner from '@/components/PromoBanner';
import JustForYou from '@/components/JustForYou';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export const revalidate = 0; // Dynamic server-rendering for single source of truth

export default async function HomePage() {
  // 1. Fetch Store Settings, Categories, Banners, and Testimonials from Shared Database
  const [settings, categories, banners, reviews] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        subcategories: true,
        productCategories: {
          where: { product: { status: 'ACTIVE' } },
          include: {
            product: {
              include: {
                categories: { include: { category: true } },
                reviews: { select: { rating: true } },
              },
            },
          },
          take: 10,
        },
      },
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    prisma.review.findMany({
      where: { status: 'APPROVED', rating: { gte: 4 } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  // 2. Fetch Top Selling Products (max 10 for carousel)
  const topSellingRaw = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { badge: { in: ['Best Selling', 'Best Seller', 'HOT'] } },
        { isFeatured: true },
      ],
    },
    orderBy: { viewCount: 'desc' },
    take: 10,
    include: {
      categories: { include: { category: true } },
      reviews: { select: { rating: true } },
    },
  });

  // Fallback if topSellingRaw is fewer than 4 products
  const topSellingProducts =
    topSellingRaw.length >= 4
      ? topSellingRaw
      : await prisma.product.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            categories: { include: { category: true } },
            reviews: { select: { rating: true } },
          },
        });

  // 3. Fetch "Just For You" Initial 10 Products
  const justForYouRaw = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      categories: { include: { category: true } },
      reviews: { select: { rating: true } },
    },
  });

  const defaultSettings = settings || {
    storeName: 'Sokher Store',
    tagline: 'Your Beauty, Our Passion',
    logoUrl: '/images/logo-icon.jpg',
    announcementText: null,
    isAnnouncementActive: false,
    freeDeliveryThreshold: 999,
    contactPhone: '+880 1700-000000',
    contactEmail: 'support@sokherstore.com',
    whatsappNumber: '+880 1700-000000',
  };

  const heroSlides = banners.filter((b) => b.type === 'HERO_SLIDER');
  const promoBanner = banners.find((b) => b.type === 'PROMO_BANNER');

  const formatProduct = (p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    regularPrice: p.regularPrice,
    stock: p.stock,
    badge: p.badge || (p.isFeatured ? 'Best Selling' : null),
    images: JSON.parse(p.images || '[]'),
    categories: p.categories?.map((c: any) => c.category) || [],
  });

  const formattedTopSelling = topSellingProducts.map(formatProduct);
  const formattedJustForYou = justForYouRaw.map(formatProduct);

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c.productCategories.length,
    subcategories: c.subcategories,
    products: c.productCategories.map((pc) => formatProduct(pc.product)),
  }));

  // Filter categories that have at least 1 product
  const categorySections = formattedCategories.filter((c) => c.products.length > 0);

  const formattedReviews = reviews.map((r) => ({
    id: r.id,
    customerName: r.customerName || 'Verified Customer',
    rating: r.rating,
    comment: r.comment,
    isVerified: r.isVerified,
  }));

  return (
    <main className="min-h-screen bg-[#FFFDFD] pb-14 sm:pb-0 relative">
      {/* 1. Header (Sticky navigation, logo left, centered search, 5 actions right) */}
      <Header settings={defaultSettings as any} categories={formattedCategories} />

      {/* 2. Hero Section: 2/3 Auto-playing Slider + 1/3 Side Banner */}
      <HeroSlider slides={heroSlides} promoBanner={promoBanner} />

      {/* 3. Section 1: Featured Categories (White rounded cards with circular image centered) */}
      <CategoryCircles categories={formattedCategories} />

      {/* 4. Section 2: Top Selling Products (Carousel with arrows) */}
      <ProductCarousel
        title="Top Selling Products"
        products={formattedTopSelling}
        viewAllLink="/shop?sort=popular"
      />

      {/* 5. Section 3: Our Brands (Hidden if no brand has a logo - never hardcode fake logos) */}
      <BrandRow brands={[]} />

      {/* 6. Section 4 & 5: One product section per featured category + 1 Full-width Promo Banner after 2nd category */}
      {categorySections.map((cat, idx) => (
        <React.Fragment key={cat.id}>
          <ProductCarousel
            title={cat.name}
            products={cat.products}
            viewAllLink={`/category/${cat.slug}`}
          />

          {/* Full-width Promo Banner placed after the 2nd category section */}
          {idx === 1 && promoBanner && (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
              <PromoBanner banner={promoBanner} />
            </div>
          )}
        </React.Fragment>
      ))}

      {/* If fewer than 2 categories existed, still show promo banner if available */}
      {categorySections.length < 2 && promoBanner && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          <PromoBanner banner={promoBanner} />
        </div>
      )}

      {/* 7. Section 6: Just For You (10 products in 5x2 grid + red outlined LOAD MORE button) */}
      <JustForYou initialProducts={formattedJustForYou} />

      {/* 8. Section 7: Testimonials (Carousel of real review cards from DB) */}
      <Testimonials reviews={formattedReviews} />

      {/* 9. Footer: 5-Column Reference Footer */}
      <Footer settings={defaultSettings as any} categories={formattedCategories} />
    </main>
  );
}
