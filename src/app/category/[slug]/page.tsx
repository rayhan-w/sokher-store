import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ShopFilterClient from '@/app/shop/ShopFilterClient';

export const revalidate = 0;

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    sort?: string;
    flag?: string | string[];
    sub?: string | string[];
    brand?: string | string[];
    maxPrice?: string;
    page?: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) return { title: 'Category Not Found - Sokher Store' };

  return {
    title: `${category.name} — Sokher Store`,
    description: category.description || `Browse ${category.name} at Sokher Store BD.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const { sort = 'default', flag, sub, brand, maxPrice, page = '1' } = searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = 16;

  // Extract array of flags, subcategories & brands
  const flags = Array.isArray(flag) ? flag : flag ? [flag] : [];
  const subs = Array.isArray(sub) ? sub : sub ? [sub] : [];
  const brands = Array.isArray(brand) ? brand : brand ? [brand] : [];

  // Fetch Category, Settings, and All Categories
  const [currentCategory, settings, allCategories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: true,
        productCategories: {
          include: {
            product: {
              select: { price: true, specification: true, badge: true, regularPrice: true },
            },
          },
        },
      },
    }),
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

  if (!currentCategory) {
    notFound();
  }

  // Calculate highest price INSIDE this category for the price slider
  const highestCategoryPrice = currentCategory.productCategories.reduce(
    (max, pc) => (pc.product.price > max ? pc.product.price : max),
    1000
  );
  const roundedMaxPrice = Math.ceil(highestCategoryPrice / 200) * 200;

  // Extract unique brands for products inside this category
  const brandSet = new Set<string>();
  currentCategory.productCategories.forEach((pc) => {
    if (pc.product.specification) {
      try {
        const spec =
          typeof pc.product.specification === 'string'
            ? JSON.parse(pc.product.specification)
            : pc.product.specification;
        const b = spec?.Brand || spec?.brand;
        if (b && typeof b === 'string') brandSet.add(b.trim());
      } catch {}
    }
  });
  const availableBrands = Array.from(brandSet).sort();

  // Build Where clause for products in this category
  const where: any = {
    status: 'ACTIVE',
    categories: {
      some: {
        categoryId: currentCategory.id,
      },
    },
  };

  if (subs.length > 0) {
    where.subcategory = {
      slug: { in: subs },
    };
  }

  if (flags.length > 0) {
    const orConditions: any[] = [];
    if (flags.includes('Best Selling')) {
      orConditions.push(
        { badge: { in: ['Best Selling', 'Best Seller', 'HOT'] } },
        { isFeatured: true }
      );
    }
    if (flags.includes('New Arrival')) {
      orConditions.push({ badge: { in: ['New Arrival', 'New', 'NEW_ARRIVAL'] } });
    }
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }
  }

  if (maxPrice) {
    where.price = { lte: parseFloat(maxPrice) };
  }

  if (brands.length > 0) {
    where.AND = brands.map((b) => ({
      specification: { contains: b },
    }));
  }

  // Category Page Sort: Default, Latest, Oldest, Price Low to High, Price High to Low, Offered Products
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'latest') orderBy = { createdAt: 'desc' };
  if (sort === 'oldest') orderBy = { createdAt: 'asc' };
  if (sort === 'price-low-to-high') orderBy = { price: 'asc' };
  if (sort === 'price-high-to-low') orderBy = { price: 'desc' };
  if (sort === 'offered-products') orderBy = { regularPrice: 'desc' };

  const [totalCount, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        categories: { include: { category: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    regularPrice: p.regularPrice,
    stock: p.stock,
    badge: p.badge,
    images: JSON.parse(p.images || '[]'),
    categories: p.categories.map((c) => c.category),
  }));

  const formattedCategories = allCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c.productCategories.length,
    subcategories: c.subcategories,
  }));

  const defaultSettings = settings || {
    storeName: 'Sokher Store',
    freeDeliveryThreshold: 999,
  };

  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);
    if (maxPrice) params.set('maxPrice', maxPrice);
    flags.forEach((f) => params.append('flag', f));
    subs.forEach((s) => params.append('sub', s));
    brands.forEach((b) => params.append('brand', b));
    params.set('page', pageNum.toString());
    return `/category/${slug}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={formattedCategories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {/* Exact Breadcrumb (Home > Shop > Category) — REMOVED oversized heading and Reset button */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d] transition">
            Home
          </Link>
          <span>&gt;</span>
          <Link href="/shop" className="hover:text-[#cc272d] transition">
            Shop
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-gray-900">{currentCategory.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Category Page Sidebar: FILTER BY CATEGORY -> PRODUCT FLAG -> PRICE RANGE -> BRANDS */}
          <aside className="lg:col-span-1">
            <ShopFilterClient
              isCategoryPage={true}
              subcategories={currentCategory.subcategories}
              maxPossiblePrice={roundedMaxPrice}
              availableBrands={availableBrands}
              basePath={`/category/${slug}`}
            />
          </aside>

          {/* Product Grid & Controls */}
          <section className="lg:col-span-3">
            {/* Top Bar: Result count ("X results") + Category sort dropdown */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {totalCount} results
              </p>

              {/* Exact Category Page Sort Options */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Sort by:</span>
                <form method="GET" action={`/category/${slug}`} className="inline">
                  {flags.map((f, i) => (
                    <input key={i} type="hidden" name="flag" value={f} />
                  ))}
                  {subs.map((s, i) => (
                    <input key={i} type="hidden" name="sub" value={s} />
                  ))}
                  {brands.map((b, i) => (
                    <input key={i} type="hidden" name="brand" value={b} />
                  ))}
                  {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
                  <select
                    name="sort"
                    defaultValue={sort}
                    onChange={(e) => e.target.form?.submit()}
                    className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#cc272d] cursor-pointer"
                  >
                    <option value="default">Default</option>
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price-low-to-high">Price Low to High</option>
                    <option value="price-high-to-low">Price High to Low</option>
                    <option value="offered-products">Offered Products</option>
                  </select>
                </form>
              </div>
            </div>

            {/* Product Grid: 4 per row on desktop (currently 3) */}
            {formattedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
                <h3 className="text-sm font-bold text-gray-900">No Products in this Category</h3>
                <p className="text-xs text-gray-500">
                  No products matched the selected filters.
                </p>
                <Link
                  href={`/category/${slug}`}
                  className="inline-block px-5 py-2 rounded-lg bg-[#cc272d] text-white text-xs font-bold hover:bg-red-700 transition"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {formattedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Numbered Pagination: 1 2 3 ... 16 per page */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <Link
                    key={num}
                    href={createPageUrl(num)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                      num === currentPage
                        ? 'bg-[#cc272d] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#cc272d] hover:text-[#cc272d]'
                    }`}
                  >
                    {num}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer settings={defaultSettings as any} categories={formattedCategories} />
    </div>
  );
}
