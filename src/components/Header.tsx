'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  PhoneCall,
  Flame,
  LayoutGrid,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/price-parser';

interface HeaderProps {
  settings: {
    storeName?: string;
    logoUrl?: string | null;
    contactPhone?: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    subcategories: Array<{ id: string; name: string; slug: string }>;
  }>;
}

export default function Header({ settings, categories = [] }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, subtotal, setIsCartDrawerOpen } = useCart();
  const { totalWishlist } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  const searchRefDesktop = useRef<HTMLDivElement>(null);
  const searchInputMobileRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hotline = settings.contactPhone || '+880 1700-000000';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');

  // Listen for events from MobileBottomNav
  useEffect(() => {
    const handleOpenMenu = () => setMobileMenuOpen(true);
    const handleOpenSearch = () => {
      setMobileSearchOpen(true);
      setTimeout(() => searchInputMobileRef.current?.focus(), 100);
    };

    window.addEventListener('open-mobile-menu', handleOpenMenu);
    window.addEventListener('open-mobile-search', handleOpenSearch);

    return () => {
      window.removeEventListener('open-mobile-menu', handleOpenMenu);
      window.removeEventListener('open-mobile-search', handleOpenSearch);
    };
  }, []);

  // Live search suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
        const data = await res.json();
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRefDesktop.current &&
        !searchRefDesktop.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'হোম', href: '/' },
    { label: 'সকল পণ্য', href: '/shop' },
    { label: 'অফার জোন', href: '/shop?badge=FLASH_SALE', isHot: true },
    { label: 'নতুন কালেকশন', href: '/shop?sort=newest' },
    { label: 'আমাদের সম্পর্কে', href: '/about' },
    { label: 'যোগাযোগ', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-gray-100">
      {/* ========================================================= */}
      {/* 1. MOBILE HEADER (EXACT 1:1 MATCH TO USER SCREENSHOT)     */}
      {/* ========================================================= */}
      <div className="lg:hidden bg-white px-4 py-2.5 flex items-center justify-between">
        {/* Left: Hamburger Icon (☰) */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-1 text-gray-800 hover:text-[#cc272d] transition active:scale-95"
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* Center: Brand Logo (Centered like screenshot) */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#e11d2e] flex items-center justify-center shadow-xs">
            <Image
              src={settings.logoUrl || '/images/logo-icon.jpg'}
              alt={settings.storeName || 'Sokher Store'}
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col leading-none text-left">
            <span className="text-lg font-black tracking-tight text-gray-950 font-sans">
              <span className="text-[#cc272d]">SOKHER</span> STORE
            </span>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
              BEAUTY & CARE
            </span>
          </div>
        </Link>

        {/* Right: Shopping Cart Icon with Badge (🛒 0) */}
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="relative p-1 text-gray-800 hover:text-[#cc272d] transition active:scale-95"
          aria-label="View Cart"
        >
          <ShoppingBag className="w-6 h-6 stroke-[2]" />
          <span className="absolute -top-1 -right-1.5 bg-[#cc272d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
            {totalItems}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. MOBILE SEARCH MODAL (Opens when user taps SEARCH)     */}
      {/* ========================================================= */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-xs flex flex-col">
          <div className="bg-white p-4 shadow-xl border-b border-gray-200">
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputMobileRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="পণ্য সার্চ করুন (যেমন: লিপস্টিক, সিরাম)..."
                  className="w-full pl-9 pr-14 py-2.5 text-xs bg-gray-50 border-2 border-[#cc272d] rounded-xl focus:outline-none focus:bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#cc272d] text-white text-xs font-bold rounded-lg"
                >
                  সার্চ
                </button>
              </form>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions list */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-gray-100 border-t border-gray-100 pt-2">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => {
                      setShowSuggestions(false);
                      setMobileSearchOpen(false);
                    }}
                    className="flex items-center gap-3 py-2 px-1 hover:bg-rose-50"
                  >
                    <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-rose-100" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                      <span className="text-xs font-black text-[#cc272d]">
                        {formatPrice(p.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1" onClick={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DESKTOP 2-TIER NAVBAR (Full Rich Experience for PC)    */}
      {/* ========================================================= */}
      <div className="hidden lg:block">
        {/* Tier 1: Main Header Row */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#e11d2e] flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                <Image
                  src={settings.logoUrl || '/images/logo-icon.jpg'}
                  alt={settings.storeName || 'Sokher Store'}
                  width={44}
                  height={44}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-tight text-gray-950 font-sans">
                  <span className="text-[#cc272d]">Sokher</span> Store
                </span>
                <span className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase">
                  শখের স্টোর • বিউটি কেয়ার
                </span>
              </div>
            </Link>

            {/* Central Wide Search Bar with Red Border */}
            <div ref={searchRefDesktop} className="relative flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="পণ্য সার্চ করুন (যেমন: লিপস্টিক, ময়েশ্চারাইজার, সানস্ক্রিন...)"
                  className="w-full pl-4 pr-24 py-2.5 text-sm bg-gray-50/80 border-2 border-[#cc272d] rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#cc272d]/20 transition placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-5 bg-[#cc272d] hover:bg-red-700 text-white rounded-md text-sm font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>সার্চ</span>
                </button>
              </form>

              {/* Desktop Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="px-3 py-2 text-[11px] font-bold text-gray-500 bg-rose-50/60 border-b flex items-center justify-between">
                    <span>অনুসন্ধান ফলাফল</span>
                    <span>{suggestions.length} টি পণ্য পাওয়া গেছে</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {suggestions.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-3 hover:bg-rose-50/60 transition group"
                      >
                        <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-rose-100 flex items-center justify-center text-xs text-[#cc272d]">
                              No Img
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-[#cc272d] truncate">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-[#cc272d]">
                              {formatPrice(p.price)}
                            </span>
                            {p.regularPrice && p.regularPrice > p.price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(p.regularPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs text-[#cc272d] font-bold hover:underline"
                    >
                      সকল ফলাফল দেখুন →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Hotline Box + Wishlist + Cart Widget */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#cc272d] hover:bg-rose-50/50 transition group"
              >
                <div className="w-9 h-9 rounded-full bg-rose-50 border border-red-200 text-[#cc272d] flex items-center justify-center flex-shrink-0 group-hover:bg-[#cc272d] group-hover:text-white transition">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-medium text-gray-500">ফোনে অর্ডার করুন</span>
                  <span className="text-xs font-black text-gray-900 group-hover:text-[#cc272d] transition">
                    {hotline}
                  </span>
                </div>
              </a>

              <Link
                href="/account/wishlist"
                className="relative p-2 text-gray-700 hover:text-[#cc272d] hover:bg-rose-50/50 rounded-lg transition"
                aria-label="উইশলিস্ট"
              >
                <Heart className="w-6 h-6" />
                {totalWishlist > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#cc272d] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {totalWishlist}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#cc272d] hover:bg-red-700 text-white font-bold transition shadow-sm active:scale-95"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-yellow-300 text-gray-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[10px] text-rose-200 font-medium">কার্ট</span>
                  <span className="text-xs font-black">{formatPrice(subtotal)}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tier 2: Secondary Navigation Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {/* All Categories Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="bg-[#cc272d] hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-t-md flex items-center gap-2.5 transition shadow-sm"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>সকল ক্যাটাগরি</span>
                  <ChevronDown
                    className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                      categoryDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-b-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in-50 duration-150">
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                      {categories.map((cat) => (
                        <div key={cat.id} className="group/item relative">
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={() => setCategoryDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-rose-50 hover:text-[#cc272d] transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-[#cc272d]/40 group-hover/item:bg-[#cc272d] transition-colors" />
                              <span>{cat.name}</span>
                            </div>
                            {cat.subcategories && cat.subcategories.length > 0 && (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-[#cc272d] group-hover/item:translate-x-0.5 transition" />
                            )}
                          </Link>

                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <div className="hidden group-hover/item:block absolute top-0 left-full w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 ml-1 z-50">
                              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                {cat.name}
                              </div>
                              {cat.subcategories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                                  onClick={() => setCategoryDropdownOpen(false)}
                                  className="block px-4 py-2 text-xs text-gray-700 hover:bg-rose-50 hover:text-[#cc272d] transition"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-2 border-t border-gray-100 bg-gray-50 mt-1">
                      <Link
                        href="/shop"
                        onClick={() => setCategoryDropdownOpen(false)}
                        className="block text-center text-xs font-bold text-[#cc272d] hover:underline py-1"
                      >
                        সকল ক্যাটাগরি ও পণ্য দেখুন →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Nav Links */}
              <nav className="flex items-center gap-7 text-sm font-semibold text-gray-700">
                {navLinks.map((link) => {
                  const isActive = link.href === '/' ? pathname === '/' : pathname === link.href;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`relative py-2.5 flex items-center gap-1.5 transition hover:text-[#cc272d] ${
                        isActive ? 'text-[#cc272d] font-bold' : ''
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.isHot && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#cc272d] text-white leading-none animate-pulse">
                          <Flame className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
                          HOT
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#cc272d] rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <Link
              href="/account"
              className="flex items-center gap-1.5 text-xs font-bold text-[#cc272d] bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full border border-rose-200 transition"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>অর্ডার ট্র্যাক করুন</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MOBILE DRAWER (Slide-out menu when ☰ is clicked)       */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="p-4 bg-[#cc272d] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center">
                  <Image
                    src={settings.logoUrl || '/images/logo-icon.jpg'}
                    alt="Sokher Store"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="leading-tight">
                  <h3 className="text-base font-black">Sokher Store</h3>
                  <p className="text-[10px] text-rose-200 font-medium">শখের স্টোর কসমেটিক্স</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Hotline in Drawer */}
            <div className="p-3 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-2 text-xs font-bold text-[#cc272d]"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>হটলাইন: {hotline}</span>
              </a>
              <span className="text-[10px] bg-[#cc272d] text-white px-2 py-0.5 rounded-full font-bold">
                ২৪/৭ কল
              </span>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Main Links */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  মেনু
                </h4>
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-lg text-sm font-semibold text-gray-800 hover:bg-rose-50 hover:text-[#cc272d] transition"
                    >
                      <span className="flex items-center gap-2">
                        {link.label}
                        {link.isHot && (
                          <span className="text-[10px] bg-[#cc272d] text-white px-1.5 py-0.5 rounded font-black">
                            HOT
                          </span>
                        )}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories Section */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>সকল ক্যাটাগরি</span>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[10px] text-[#cc272d] font-bold"
                  >
                    সব দেখুন →
                  </Link>
                </h4>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isExpanded = expandedMobileCat === cat.id;
                    const hasSubs = cat.subcategories && cat.subcategories.length > 0;

                    return (
                      <div key={cat.id} className="rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-2 text-sm font-semibold text-gray-800 hover:bg-rose-50 transition">
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 hover:text-[#cc272d]"
                          >
                            {cat.name}
                          </Link>
                          {hasSubs && (
                            <button
                              onClick={() => setExpandedMobileCat(isExpanded ? null : cat.id)}
                              className="p-1 text-gray-400 hover:text-gray-900"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {hasSubs && isExpanded && (
                          <div className="pl-4 pr-2 py-1 bg-gray-50 border-l-2 border-[#cc272d] space-y-1">
                            {cat.subcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1.5 text-xs text-gray-600 hover:text-[#cc272d]"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-lg bg-gray-900 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition"
              >
                <Truck className="w-4 h-4" />
                <span>আমার অ্যাকাউন্ট ও অর্ডার ট্র্যাক</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
