'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  regularPrice?: number | null;
  image: string;
  sku: string;
  variant?: string | null;
  quantity: number;
  stock: number;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (productId: string, variant?: string | null) => void;
  updateQuantity: (productId: string, variant: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  subtotal: number;
  totalItems: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sokher_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem('sokher_coupon');
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sokher_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (appliedCoupon) {
        localStorage.setItem('sokher_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('sokher_coupon');
      }
    }
  }, [appliedCoupon, isLoaded]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === product.productId && (i.variant || '') === (product.variant || '')
      );

      if (existingIdx > -1) {
        const next = [...prev];
        const newQty = Math.min(next[existingIdx].stock, next[existingIdx].quantity + qty);
        next[existingIdx] = { ...next[existingIdx], quantity: newQty };
        return next;
      }

      return [...prev, { ...product, quantity: Math.min(product.stock, qty) }];
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, variant?: string | null) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && (i.variant || '') === (variant || ''))));
  };

  const updateQuantity = (productId: string, variant: string | null | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && (item.variant || '') === (variant || '')) {
          return { ...item, quantity: Math.min(item.stock, quantity) };
        }
        return item;
      })
    );
  };

  // Rule #6: Clear Cart button MUST work reliably and reset totals to 0
  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem('sokher_cart');
      localStorage.removeItem('sokher_coupon');
    } catch {}
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        setAppliedCoupon,
        subtotal,
        totalItems,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
