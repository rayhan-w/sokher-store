import React from 'react';
import prisma from '@/lib/prisma';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutFormClient from './CheckoutFormClient';

export const revalidate = 0;

export default async function CheckoutPage() {
  const settings = await prisma.storeSetting.findUnique({
    where: { id: 'default' },
  });

  const defaultSettings = settings || {
    storeName: 'Sokher Store',
    deliveryDhaka: 70,
    deliveryDhakaSuburbs: 100,
    deliveryOutsideDhaka: 130,
    freeDeliveryThreshold: 999,
    bkashNumber: '01712345678',
    nagadNumber: '01812345678',
  };

  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <AnnouncementBar settings={defaultSettings as any} />
      <Header settings={defaultSettings as any} categories={[]} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <CheckoutFormClient settings={defaultSettings as any} />
      </main>

      <Footer settings={defaultSettings as any} />
    </div>
  );
}
