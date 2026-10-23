'use client';

import React from 'react';
import { Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react';

interface TrustBarItem {
  icon: string;
  title: string;
  subtitle: string;
}

interface TrustBarProps {
  items?: TrustBarItem[] | null;
}

export default function TrustBar({ items }: TrustBarProps) {
  const defaultItems: TrustBarItem[] = [
    {
      icon: 'Truck',
      title: 'Fast Delivery',
      subtitle: 'All over Bangladesh',
    },
    {
      icon: 'ShieldCheck',
      title: '100% Genuine',
      subtitle: 'Original Products',
    },
    {
      icon: 'Headphones',
      title: '24/7 Support',
      subtitle: "We're here to help",
    },
    {
      icon: 'RotateCcw',
      title: 'Easy Return',
      subtitle: 'Hassle free policy',
    },
  ];

  const displayItems = items && items.length > 0 ? items : defaultItems;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Truck':
        return <Truck className="w-6 h-6 text-[#cc272d]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-[#cc272d]" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-[#cc272d]" />;
      case 'RotateCcw':
        return <RotateCcw className="w-6 h-6 text-[#cc272d]" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-[#cc272d]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
      <div className="bg-white rounded-2xl shadow-xl shadow-rose-950/5 border border-rose-100 p-5 sm:p-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-rose-100/60">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3.5 sm:gap-4 ${
                idx > 0 ? 'pt-4 md:pt-0 md:pl-6' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 border border-rose-100/60">
                {renderIcon(item.icon)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
