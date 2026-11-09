import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 0;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: params.slug }, { id: params.slug }] },
  });

  if (!product) return { title: 'Product Not Found - Sokher Store' };

  return {
    title: product.seoTitle || `${product.name} — Sokher Store`,
    description: product.seoDescription || product.description?.slice(0, 160) || 'Authentic cosmetics at Sokher Store BD.',
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || '',
      images: JSON.parse(product.images || '[]')[0] || '/images/logo-icon.jpg',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  // Increment view count atomically
  const product = await prisma.product.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
    include: {
      categories: { include: { category: true } },
      subcategory: true,
      reviews: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
      },
    },
  }).catch(async () => {
    // If not found by slug, try by ID
    return await prisma.product.update({
      where: { id: slug },
      data: { viewCount: { increment: 1 } },
      include: {
        categories: { include: { category: true } },
        subcategory: true,
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    }).catch(() => null);
  });

  if (!product) {
    notFound();
  }

  // Fetch Settings, Categories, and Related Products (up to 12)
  const categoryIds = product.categories.map((c) => c.categoryId);

  const [settings, categories, primaryRelated] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        subcategories: true,
        productCategories: { where: { product: { status: 'ACTIVE' } } },
      },
    }),
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        NOT: { id: product.id },
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
      },
      take: 12,
      include: {
        categories: { include: { category: true } },
        reviews: { select: { rating: true } },
      },
    }),
  ]);

  // If fewer than 12 related in same category, supplement with other active products
  let relatedProducts = primaryRelated;
  if (relatedProducts.length < 12) {
    const existingIds = [product.id, ...relatedProducts.map((p) => p.id)];
    const additional = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        NOT: { id: { in: existingIds } },
      },
      take: 12 - relatedProducts.length,
      include: {
        categories: { include: { category: true } },
        reviews: { select: { rating: true } },
      },
    });
    relatedProducts = [...relatedProducts, ...additional];
  }

  const defaultSettings = settings || {
    storeName: 'Sokher Store',
    announcementText: null,
    freeDeliveryThreshold: 999,
  };

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c.productCategories.length,
    subcategories: c.subcategories,
  }));

  const formatProduct = (p: any) => {
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
      categories: p.categories.map((c: any) => c.category),
    };
  };

  const formattedProduct = {
    ...formatProduct(product),
    description: product.description,
    specification: product.specification,
    variants: product.variants ? JSON.parse(product.variants) : [],
    reviews: product.reviews,
    primaryCategory: product.categories?.[0]?.category || null,
  };

  const formattedRelated = relatedProducts.map(formatProduct);

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <Header settings={defaultSettings as any} categories={formattedCategories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        <ProductDetailClient
          product={formattedProduct}
          relatedProducts={formattedRelated}
          settings={defaultSettings}
        />
      </main>

      <Footer settings={defaultSettings as any} categories={formattedCategories} />
    </div>
  );
}
