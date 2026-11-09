'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  currentSort: string;
  options: SortOption[];
}

export default function SortSelect({ currentSort, options }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSort = e.target.value;
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (nextSort && nextSort !== 'default') {
      params.set('sort', nextSort);
    } else {
      params.delete('sort');
    }
    params.delete('page'); // Reset to page 1 on sort change
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`);
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      aria-label="Sort products"
      className="bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#cc272d] cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
