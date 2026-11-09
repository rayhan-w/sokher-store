import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ShopFilterClient from './ShopFilterClient';
import SortSelect, { SortOption } from '@/components/SortSelect';

export const revalidate = 0;

interface ShopPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    flag?: string | string[];
    brand?: string | string[];
    category?: string;
    subcategory?: string;
    badge?: string;
    maxPrice?: string;
    page?: string;
  };
}

const SHOP_SORT_OPTIONS: SortOption[] = [
  { value: 'default', label: 'Default' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'latest', label: 'Latest' },
  { value: 'price-low-to-high', label: 'Price Low to High' },
  { value: 'price-high-to-low', label: 'Price High to Low' },
];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const {
    search,
    sort = 'default',
    flag,
    brand,
    category,
    subcategory,
    badge,
    maxPrice,
    page = '1',
  } = searchParams;

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = 16;

  // Extract array of flags & brands
  const flags = Array.isArray(flag) ? flag : flag ? [flag] : [];
  const brands = Array.isArray(brand) ? brand : brand ? [brand] : [];

  // Fetch Settings, Categories, & catalog stats
  const [settings, categories, allActiveProducts] = await Promise.all([
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
      where: { status: 'ACTIVE' },
      select: { price: true, specification: true },
    }),
  ]);

  // Determine Max Price across catalog
  const highestCatalogPrice = allActiveProducts.reduce(
    (max, p) => (p.price > max ? p.price : max),
    2000
  );
  const roundedMaxPrice = Math.ceil(highestCatalogPrice / 500) * 500;

  // Extract unique brands from specifications
  const brandSet = new Set<string>();
  allActiveProducts.forEach((p) => {
    if (p.specification) {
      try {
        const spec = typeof p.specification === 'string' ? JSON.parse(p.specification) : p.specification;
        const b = spec?.Brand || spec?.brand;
        if (b && typeof b === 'string') brandSet.add(b.trim());
      } catch {}
    }
  });
  const availableBrands = Array.from(brandSet).sort();

  // Build conditions array for clean Prisma querying
  const conditions: any[] = [{ status: 'ACTIVE' }];

  if (search) {
    const q = search.trim();
    conditions.push({
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ],
    });
  }

  if (category) {
    conditions.push({
      categories: {
        some: {
          category: { slug: category },
        },
      },
    });
  }

  if (subcategory) {
    conditions.push({
      subcategory: { slug: subcategory },
    });
  }

  if (badge) {
    if (badge === 'FLASH_SALE' || badge === 'OFFER' || badge === 'DISCOUNT') {
      conditions.push({
        regularPrice: { not: null },
      });
    } else {
      conditions.push({
        badge: { contains: badge },
      });
    }
  }

  if (flags.length > 0) {
    const flagConditions: any[] = [];
    if (flags.includes('Best Selling')) {
      flagConditions.push(
        { badge: { in: ['Best Selling', 'Best Seller', 'HOT'] } },
        { isFeatured: true }
      );
    }
    if (flags.includes('New Arrival')) {
      flagConditions.push({ badge: { in: ['New Arrival', 'New', 'NEW_ARRIVAL'] } });
    }
    if (flagConditions.length > 0) {
      conditions.push({ OR: flagConditions });
    }
  }

  if (maxPrice) {
    conditions.push({ price: { lte: parseFloat(maxPrice) } });
  }

  if (brands.length > 0) {
    conditions.push({
      AND: brands.map((b) => ({
        specification: { contains: b },
      })),
    });
  }

  const where: any = conditions.length === 1 ? conditions[0] : { AND: conditions };

  // Sort logic: Default, Best Selling (also handles 'popular'), Latest, Price Low to High, Price High to Low
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'best-selling' || sort === 'popular') {
    orderBy = { viewCount: 'desc' };
  } else if (sort === 'latest') {
    orderBy = { createdAt: 'desc' };
  } else if (sort === 'price-low-to-high') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price-high-to-low') {
    orderBy = { price: 'desc' };
  }

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
    freeDeliveryThreshold: 999,
  };

  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sort && sort !== 'default') params.set('sort', sort);
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (badge) params.set('badge', badge);
    if (maxPrice) params.set('maxPrice', maxPrice);
    flags.forEach((f) => params.append('flag', f));
    brands.forEach((b) => params.append('brand', b));
    params.set('page', pageNum.toString());
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={formattedCategories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {/* Breadcrumb: Home > Shop */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#cc272d] transition">
            Home
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-gray-900">Shop</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar: PRODUCT FLAG -> PRICE RANGE -> BRANDS */}
          <aside className="lg:col-span-1">
            <ShopFilterClient
              isCategoryPage={false}
              maxPossiblePrice={roundedMaxPrice}
              availableBrands={availableBrands}
              basePath="/shop"
            />
          </aside>

          {/* Product Grid & Controls */}
          <section className="lg:col-span-3">
            {/* Top Bar: Result count ("X results") + Sort dropdown */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {totalCount} results
              </p>

              {/* Exact Shop Sort Options */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Sort by:</span>
                <SortSelect currentSort={sort} options={SHOP_SORT_OPTIONS} />
              </div>
            </div>

            {/* Product Grid: 4 per row on desktop */}
            {formattedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
                <h3 className="text-sm font-bold text-gray-900">No Products Found</h3>
                <p className="text-xs text-gray-500">
                  No products match your selected filters. Try adjusting your filter selection.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2 rounded-lg bg-[#cc272d] text-white text-xs font-bold hover:bg-red-700 transition"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {formattedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Numbered Pagination: 16 per page */}
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
