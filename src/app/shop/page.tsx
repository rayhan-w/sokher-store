import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ShopFilterClient from './ShopFilterClient';

export const revalidate = 0;

interface ShopPageProps {
  searchParams: {
    category?: string;
    subcategory?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    badge?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, subcategory, search, sort = 'newest', minPrice, maxPrice, badge } = searchParams;

  // Fetch Settings & Categories
  const [settings, categories] = await Promise.all([
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
  ]);

  // Build Where clause for products
  const where: any = { status: 'ACTIVE' };

  if (category) {
    where.categories = {
      some: {
        category: {
          slug: category,
        },
      },
    };
  }

  if (subcategory) {
    where.subcategory = {
      slug: subcategory,
    };
  }

  if (badge) {
    where.badge = badge;
  }

  if (search) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  // Sort
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-low') orderBy = { price: 'asc' };
  if (sort === 'price-high') orderBy = { price: 'desc' };
  if (sort === 'popular') orderBy = { viewCount: 'desc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      categories: { include: { category: true } },
      subcategory: true,
      reviews: { select: { rating: true } },
    },
  });

  const formattedProducts = products.map((p) => {
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
      reviewCount: totalRatings > 0 ? totalRatings : 500,
      categories: p.categories.map((c) => c.category),
    };
  });

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c.productCategories.length,
    subcategories: c.subcategories,
  }));

  const defaultSettings = settings || {
    storeName: 'Sokher Store',
    announcementText: 'Free Shipping on orders over ৳999',
    freeDeliveryThreshold: 999,
  };

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <AnnouncementBar settings={defaultSettings} />
      <Header settings={defaultSettings as any} categories={formattedCategories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d]">Home</Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">Shop</span>
          {category && (
            <>
              <span>/</span>
              <span className="font-semibold text-[#cc272d] capitalize">{category.replace('-', ' ')}</span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <ShopFilterClient categories={formattedCategories} currentCategory={category} currentSubcategory={subcategory} />
          </aside>

          {/* Product Grid & Controls */}
          <section className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-100">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {category ? category.replace('-', ' ').toUpperCase() : 'All Beauty Products'}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing {formattedProducts.length} results
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Sort by:</span>
                <select
                  defaultValue={sort}
                  className="bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="popular">Best Selling / Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {formattedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-[#cc272d] flex items-center justify-center mx-auto text-xl font-bold">
                  !
                </div>
                <h3 className="text-base font-bold text-gray-900">কোনো পণ্য পাওয়া যায়নি</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                  আপনার নির্বাচিত ফিল্টার বা কি-ওয়ার্ডের সাথে কোনো পণ্য মেলেনি। অন্য ক্যাটাগরি বা শব্দ দিয়ে চেষ্টা করুন।
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-6 py-2.5 rounded-full bg-[#cc272d] text-white text-xs font-semibold hover:bg-red-700 transition"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                {formattedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer settings={defaultSettings as any} />
    </div>
  );
}
