import React from 'react';
import { redirect } from 'next/navigation';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  // Seamlessly routes to the shop page with the category filter
  redirect(`/shop?category=${encodeURIComponent(params.slug)}`);
}
