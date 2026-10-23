'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Timer, ArrowRight } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
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

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [flashSale]);

  // Rule: Do NOT show expired sales live
  if (!flashSale || isExpired || !timeLeft || !flashSale.items || flashSale.items.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-r from-red-600 via-[#cc272d] to-red-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-red-600/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Flame className="w-6 h-6 text-yellow-300 animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-300">
                Limited Time Deals
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{flashSale.title}</h2>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-100 flex items-center gap-1">
              <Timer className="w-4 h-4" /> Ends in:
            </span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm">
              <span className="bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10 text-yellow-300">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        {/* Flash Sale Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {flashSale.items.map((item) => {
            const p = item.product;
            return (
              <ProductCard
                key={item.id}
                product={{
                  ...p,
                  price: item.salePrice,
                  regularPrice: p.price, // regular is original price
                  badge: 'Flash Deal',
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
