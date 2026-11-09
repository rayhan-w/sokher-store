'use client';

import React from 'react';
import { Truck, ShieldCheck, Headphones, RotateCcw, Banknote } from 'lucide-react';

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
      title: 'সারা দেশে ডেলিভারি',
      subtitle: 'দ্রুত ও নিরাপদ হোম ডেলিভারি',
    },
    {
      icon: 'ShieldCheck',
      title: '১০০% অরিজিনাল পণ্য',
      subtitle: 'সরাসরি অথেন্টিক সোর্স থেকে',
    },
    {
      icon: 'Banknote',
      title: 'ক্যাশ অন ডেলিভারি',
      subtitle: 'পণ্য দেখে টাকা পরিশোধের সুবিধা',
    },
    {
      icon: 'RotateCcw',
      title: 'সহজ রিটার্ন পলিসি',
      subtitle: 'পণ্য পছন্দ না হলে সহজ সমাধান',
    },
    {
      icon: 'Headphones',
      title: '২৪/৭ সাপোর্ট',
      subtitle: 'যেকোনো প্রয়োজনে পাশে আছি',
    },
  ];

  const displayItems = items && items.length > 0 ? items : defaultItems;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Truck':
        return <Truck className="w-6 h-6 text-[#cc272d]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-[#cc272d]" />;
      case 'Banknote':
        return <Banknote className="w-6 h-6 text-[#cc272d]" />;
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
      <div className="bg-white rounded-2xl shadow-xl shadow-rose-950/5 border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 divide-y sm:divide-y-0 divide-gray-100">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 ${
                idx > 0 ? 'pt-3 sm:pt-0' : ''
              } group`}
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#cc272d] group-hover:text-white transition duration-300">
                {renderIcon(item.icon)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug group-hover:text-[#cc272d] transition truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
