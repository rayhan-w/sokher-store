import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductFormClient from '../../ProductFormClient';

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        categories: { include: { category: true } },
        subcategory: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { subcategories: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const formattedProduct = {
    ...product,
    images: JSON.parse(product.images || '[]'),
    specification: product.specification ? JSON.parse(product.specification) : null,
    variants: product.variants ? JSON.parse(product.variants) : null,
    categories: product.categories.map((c) => c.category),
  };

  return <ProductFormClient initialProduct={formattedProduct} categories={categories} />;
}
