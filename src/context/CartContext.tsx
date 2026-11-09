'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

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
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string, variant?: string | null) => void;
  isInCart: (productId: string, variant?: string | null) => boolean;
  updateQuantity: (productId: string, variant: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  subtotal: number;
  totalItems: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

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

  const addToCart = (product: Omit<CartItem, 'quantity'>, qty = 1, openDrawer = false) => {
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

    showToast('Added to Cart');

    // Trigger Meta Pixel & GTM add_to_cart tracking events without breaking
    if (typeof window !== 'undefined') {
      try {
        if ((window as any).fbq) {
          (window as any).fbq('track', 'AddToCart', {
            content_name: product.name,
            content_ids: [product.productId],
            content_type: 'product',
            value: product.price * qty,
            currency: 'BDT',
          });
        }
        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: 'add_to_cart',
            ecommerce: {
              currency: 'BDT',
              value: product.price * qty,
              items: [
                {
                  item_id: product.productId,
                  item_name: product.name,
                  price: product.price,
                  quantity: qty,
                },
              ],
            },
          });
        }
      } catch {}
    }

    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
  };

  const removeFromCart = (productId: string, variant?: string | null) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && (i.variant || '') === (variant || '')))
    );
    showToast('Removed from Cart');
  };

  const isInCart = (productId: string, variant?: string | null) => {
    return items.some(
      (i) => i.productId === productId && (i.variant || '') === (variant || '')
    );
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
        isInCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        setAppliedCoupon,
        subtotal,
        totalItems,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        showToast,
      }}
    >
      {children}

      {/* Floating Add to Cart Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#18181b] text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
