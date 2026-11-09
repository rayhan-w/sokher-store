'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Timer, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

interface FlashSaleSectionProps {
  flashSale?: {
    id: string;
    title: string;
    startTime: string | Date;
    endTime: string | Date;
    items: Array<{
      id: string;
      salePrice: number;
      product: any;
    }>;
  } | null;
}

export default function FlashSaleSection({ flashSale }: FlashSaleSectionProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!flashSale || !flashSale.endTime) {
      setIsExpired(true);
      return;
    }

    const calculateTime = () => {
      const difference = new Date(flashSale.endTime).getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [flashSale]);

  if (!flashSale || isExpired || !timeLeft || !flashSale.items || flashSale.items.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-r from-red-600 via-[#cc272d] to-red-700 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-red-600/20">
        {/* Flash Sale Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Flame className="w-7 h-7 text-yellow-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-yellow-300 text-gray-950 px-2 py-0.5 rounded-full">
                  হট অফার
                </span>
                <span className="text-xs text-rose-100 font-semibold">সীমিত সময়ের ডিল</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                {flashSale.title}
              </h2>
            </div>
          </div>

          {/* Countdown Timer Boxes (Ghorer Bazar Style) */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-rose-100 flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-yellow-300" /> অফার শেষ হতে বাকি:
            </span>
            <div className="flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm">
              {timeLeft.days > 0 && (
                <>
                  <div className="bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-center">
                    <div>{String(timeLeft.days).padStart(2, '0')}</div>
                    <div className="text-[9px] text-gray-300 font-sans font-normal">দিন</div>
                  </div>
                  <span>:</span>
                </>
              )}
              <div className="bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-center min-w-[2.5rem]">
                <div>{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-[9px] text-gray-300 font-sans font-normal">ঘণ্টা</div>
              </div>
              <span>:</span>
              <div className="bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-center min-w-[2.5rem]">
                <div>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-[9px] text-gray-300 font-sans font-normal">মিনিট</div>
              </div>
              <span>:</span>
              <div className="bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-center min-w-[2.5rem] text-yellow-300">
                <div>{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-[9px] text-yellow-200 font-sans font-normal">সেকেন্ড</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-6">
          {flashSale.items.map((item) => {
            const p = item.product;
            const formattedProduct = {
              id: p.id,
              name: p.name,
              slug: p.slug,
              sku: p.sku,
              price: item.salePrice,
              regularPrice: p.price,
              stock: p.stock,
              badge: 'হট ডিল',
              images: JSON.parse(p.images || '[]'),
              rating: 5,
              reviewCount: 350,
              categories: p.categories?.map((c: any) => c.category) || [],
            };

            return (
              <div key={item.id} className="text-gray-900">
                <ProductCard product={formattedProduct} />
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-[#cc272d] font-bold text-xs sm:text-sm hover:bg-rose-50 transition shadow-lg"
          >
            <span>সব অফার পণ্য দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
