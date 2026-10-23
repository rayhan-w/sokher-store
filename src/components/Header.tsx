'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface HeaderProps {
  settings: {
    storeName?: string;
    logoUrl?: string | null;
  };
  categories: Array<{ id: string; name: string; slug: string; subcategories: Array<{ id: string; name: string; slug: string }> }>;
}

export default function Header({ settings, categories = [] }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { totalWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Live search suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Categories', href: '/shop', hasDropdown: true },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 text-gray-700 hover:text-[#cc272d]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-[#e11d2e] flex items-center justify-center shadow-sm">
            <Image
              src={settings.logoUrl || '/images/logo-icon.jpg'}
              alt={settings.storeName || 'Sokher Store'}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight text-gray-900 font-sans">
              <span className="text-[#cc272d]">Sokher</span> Store
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide">BEAUTY & CARE</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-700">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

            if (link.hasDropdown) {
              return (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setCategoriesDropdownOpen(true)}
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                >
                  <button className="flex items-center gap-1 hover:text-[#cc272d] transition py-1">
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#cc272d] transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Dropdown Menu */}
                  {categoriesDropdownOpen && (
                    <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2.5 z-50">
                      {categories.map((cat) => (
                        <div key={cat.id} className="relative group/sub">
                          <Link
                            href={`/category/${cat.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-[#cc272d] transition"
                          >
                            <span>{cat.name}</span>
                            {cat.subcategories && cat.subcategories.length > 0 && (
                              <span className="text-xs text-gray-400">›</span>
                            )}
                          </Link>
                        </div>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link
                          href="/shop"
                          className="block px-4 py-2 text-xs font-semibold text-[#cc272d] hover:bg-rose-50"
                        >
                          View All Categories →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative py-1 transition hover:text-[#cc272d] ${
                  isActive ? 'text-[#cc272d] font-semibold' : ''
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc272d] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search for your favorite products..."
              className="w-full pl-4 pr-11 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#cc272d]/30 focus:border-[#cc272d] transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#cc272d] text-white flex items-center justify-center hover:bg-red-700 transition"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="p-2 text-xs font-semibold text-gray-400 bg-gray-50 border-b">
                Product Suggestions
              </div>
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 p-3 hover:bg-rose-50 transition border-b border-gray-50 last:border-none"
                >
                  <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs font-bold text-[#cc272d]">৳ {p.price}</p>
                  </div>
                </Link>
              ))}
              <div className="p-2 bg-gray-50 text-center">
                <button
                  onClick={handleSearchSubmit}
                  className="text-xs text-[#cc272d] font-semibold hover:underline"
                >
                  See all matching products →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Badges (Wishlist & Cart) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/account/wishlist"
            className="relative p-2 text-gray-700 hover:text-[#cc272d] transition rounded-full hover:bg-gray-100"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#cc272d] text-white text-[10px] font-bold flex items-center justify-center">
              {totalWishlist}
            </span>
          </Link>

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative p-2 text-gray-700 hover:text-[#cc272d] transition rounded-full hover:bg-gray-100"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#cc272d] text-white text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (under header on phones) */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-4 pr-10 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#cc272d] text-white flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white py-3 px-4 shadow-lg">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg text-sm font-medium ${
                  pathname === link.href ? 'bg-rose-50 text-[#cc272d]' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
