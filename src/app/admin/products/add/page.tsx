import React from 'react';
import prisma from '@/lib/prisma';
import ProductFormClient from '../ProductFormClient';

export const revalidate = 0;

export default async function AddProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { subcategories: true },
  });

  return <ProductFormClient categories={categories} />;
}
