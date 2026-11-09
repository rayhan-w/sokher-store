'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-36 sm:bottom-24 right-4 z-40 w-11 h-11 rounded-full bg-[#cc272d] hover:bg-red-700 active:scale-95 text-white flex flex-col items-center justify-center shadow-xl transition-all duration-200 border-2 border-white/20 select-none group"
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp className="w-4 h-4 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
      <span className="text-[8px] font-black uppercase tracking-tight leading-none">Top</span>
    </button>
  );
}
