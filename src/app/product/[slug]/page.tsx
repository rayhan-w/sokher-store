import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AnnouncementBar from '@/components/AnnouncementBar';
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

  // Fetch Settings, Categories, and Related Products
  const [settings, categories, relatedProducts] = await Promise.all([
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
            categoryId: { in: product.categories.map((c) => c.categoryId) },
          },
        },
      },
      take: 4,
      include: {
        categories: { include: { category: true } },
        reviews: { select: { rating: true } },
      },
    }),
  ]);

  const defaultSettings = settings || {
    storeName: 'Sokher Store',
    announcementText: 'Free Shipping on orders over ৳999',
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

  const formattedRelated = relatedProducts.map((p) => {
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
      reviewCount: totalRatings,
    };
  });

  const parsedImages = JSON.parse(product.images || '[]');
  const parsedSpecs = product.specification ? JSON.parse(product.specification) : null;
  const parsedVariants = product.variants ? JSON.parse(product.variants) : null;

  const totalReviews = product.reviews.length;
  const avgRating = totalReviews > 0
    ? Math.round((product.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
    : 4.8;

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <AnnouncementBar settings={defaultSettings} />
      <Header settings={defaultSettings as any} categories={formattedCategories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <ProductDetailClient
          product={{
            ...product,
            images: parsedImages,
            specification: parsedSpecs,
            variants: parsedVariants,
            rating: avgRating,
            reviewCount: totalReviews,
            categories: product.categories.map((c) => c.category),
          }}
          relatedProducts={formattedRelated}
          settings={defaultSettings as any}
        />
      </main>

      <Footer settings={defaultSettings as any} />
    </div>
  );
}
