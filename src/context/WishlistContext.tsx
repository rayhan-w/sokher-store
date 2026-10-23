'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  regularPrice?: number | null;
  image: string;
  badge?: string | null;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  totalWishlist: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sokher_wishlist');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sokher_wishlist', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const toggleWishlist = (product: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.productId === product.productId);
      if (exists) {
        return prev.filter((i) => i.productId !== product.productId);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isInWishlist,
        totalWishlist: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
