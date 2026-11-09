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
  User,
  MapPin,
  HelpCircle,
  Info,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
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
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const searchRefDesktop = useRef<HTMLDivElement>(null);
  const searchInputMobileRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const hotline = settings.contactPhone || '+880 1700-000000';
  const cleanPhone = hotline.replace(/[^0-9+]/g, '');
  const cleanWa = cleanPhone.replace(/[^0-9]/g, '');

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
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
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
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Offers', href: '/shop?badge=FLASH_SALE', isHot: true },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-gray-100">
      {/* ========================================================= */}
      {/* 1. MOBILE HEADER (Clean & Minimalist like Screenshot)     */}
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

        {/* Center: Brand Logo */}
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
      {/* 2. MOBILE SEARCH MODAL (Triggered from Bottom Bar SEARCH) */}
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
                  placeholder="Search products (e.g. Lipstick, Serum)..."
                  className="w-full pl-9 pr-16 py-2.5 text-xs bg-gray-50 border-2 border-[#cc272d] rounded-xl focus:outline-none focus:bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#cc272d] text-white text-xs font-bold rounded-lg"
                >
                  Search
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
      {/* 3. DESKTOP MINIMAL NAVBAR (1:1 Match to Ghorer Bazar PC)  */}
      {/* ========================================================= */}
      <div className="hidden lg:block">
        {/* Tier 1: Main Header Row (Clean White: Logo | Search in... | 5 Actions) */}
        <div className="bg-white border-b border-gray-100/90">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
            {/* Left: Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#cc272d] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Image
                  src={settings.logoUrl || '/images/logo-icon.jpg'}
                  alt={settings.storeName || 'Sokher Store'}
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight text-gray-950 font-sans">
                  <span className="text-[#cc272d]">SOKHER</span> STORE
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  BEAUTY & CARE
                </span>
              </div>
            </Link>

            {/* Center: Minimalist Search Bar ("Search in...") */}
            <div ref={searchRefDesktop} className="relative flex-1 max-w-md mx-6">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search in..."
                  className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-[#f4f5f7] hover:bg-[#eaecee] focus:bg-white border border-transparent focus:border-gray-200 rounded-lg focus:outline-none transition placeholder:text-gray-400 text-gray-800"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-3 text-gray-400 hover:text-[#cc272d] transition"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Autocomplete suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-3 py-2 text-[11px] font-bold text-gray-400 bg-gray-50 border-b flex items-center justify-between">
                    <span>Products Found</span>
                    <span>{suggestions.length} items</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {suggestions.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-3 hover:bg-rose-50/40 transition group"
                      >
                        <div className="relative w-11 h-11 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-rose-50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#cc272d] truncate">
                            {p.name}
                          </p>
                          <span className="text-xs font-bold text-[#cc272d]">
                            {formatPrice(p.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: 5 Action Icons (Track Order, Sign In, Wishlist, Cart, More) */}
            <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0">
              {/* 1. Track Order */}
              <Link
                href="/account"
                className="flex flex-col items-center justify-center text-gray-700 hover:text-[#cc272d] transition group min-w-[48px]"
              >
                <Truck className="w-5 h-5 stroke-[1.6] group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-[#cc272d] mt-1 whitespace-nowrap">
                  Track Order
                </span>
              </Link>

              {/* 2. Sign In */}
              <Link
                href={user ? (user.role === 'ADMIN' ? '/admin' : '/account') : '/login'}
                className="flex flex-col items-center justify-center text-gray-700 hover:text-[#cc272d] transition group min-w-[48px]"
              >
                <User className="w-5 h-5 stroke-[1.6] group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-[#cc272d] mt-1 whitespace-nowrap max-w-[64px] truncate">
                  {user ? user.name.split(' ')[0] : 'Sign In'}
                </span>
              </Link>

              {/* 3. Wishlist */}
              <Link
                href="/account/wishlist"
                className="relative flex flex-col items-center justify-center text-gray-700 hover:text-[#cc272d] transition group min-w-[48px]"
              >
                <div className="relative">
                  <Heart className="w-5 h-5 stroke-[1.6] group-hover:scale-105 transition-transform" />
                  {totalWishlist > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#cc272d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {totalWishlist}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-[#cc272d] mt-1 whitespace-nowrap">
                  Wishlist
                </span>
              </Link>

              {/* 4. Cart */}
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex flex-col items-center justify-center text-gray-700 hover:text-[#cc272d] transition group min-w-[48px]"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 stroke-[1.6] group-hover:scale-105 transition-transform" />
                  <span className="absolute -top-1 -right-2 bg-[#cc272d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-[#cc272d] mt-1 whitespace-nowrap">
                  Cart
                </span>
              </button>

              {/* 5. More (Desktop Dropdown: Wishlists, Faqs, About Us, Call Us, WhatsApp) */}
              <div ref={moreDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen((prev) => !prev)}
                  className="flex flex-col items-center justify-center text-gray-700 hover:text-[#cc272d] transition group min-w-[48px]"
                  aria-expanded={moreDropdownOpen}
                  aria-label="More options"
                >
                  <Menu className="w-5 h-5 stroke-[1.6] group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-[#cc272d] mt-1 whitespace-nowrap">
                    More
                  </span>
                </button>

                {moreDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in-50 duration-150">
                    <Link
                      href="/account/wishlist"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-[#cc272d] transition"
                    >
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span>Wishlists</span>
                    </Link>

                    <Link
                      href="/faq"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-[#cc272d] transition"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <span>Faqs</span>
                    </Link>

                    <Link
                      href="/about"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-[#cc272d] transition"
                    >
                      <Info className="w-4 h-4 text-gray-400" />
                      <span>About Us</span>
                    </Link>

                    <a
                      href={`tel:${cleanPhone}`}
                      onClick={() => setMoreDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-[#cc272d] transition"
                    >
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>Call Us ({hotline})</span>
                    </a>

                    <a
                      href={`https://wa.me/${cleanWa}?text=Hello%20Sokher%20Store%2C%20I%20have%20an%20inquiry`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Solid Dark Sub-Navigation Bar */}
        <div className="bg-[#18181b] text-white border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-7 overflow-x-auto no-scrollbar py-2 text-xs font-medium">
            {/* Offer Zone: All nav items white text */}
            <Link
              href="/shop?badge=FLASH_SALE"
              className="text-white hover:text-gray-200 font-bold whitespace-nowrap py-1 transition flex items-center gap-1"
            >
              <span>Offer Zone</span>
            </Link>

            {/* Category Items with Dropdown on Hover */}
            {categories.map((cat) => {
              const hasSubs = cat.subcategories && cat.subcategories.length > 0;
              return (
                <div key={cat.id} className="relative group/nav py-1">
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-white hover:text-gray-200 whitespace-nowrap flex items-center gap-1 transition"
                  >
                    <span>{cat.name}</span>
                    {hasSubs && (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover/nav:text-white group-hover/nav:rotate-180 transition-transform" />
                    )}
                  </Link>

                  {hasSubs && (
                    <div className="hidden group-hover/nav:block absolute top-full left-0 min-w-[190px] bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in-50 duration-150">
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                        {cat.name}
                      </div>
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                          className="block px-3.5 py-1.5 text-xs text-gray-700 hover:bg-rose-50 hover:text-[#cc272d] transition"
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
                  <p className="text-[10px] text-rose-200 font-medium">Beauty & Skincare</p>
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
                <span>Hotline: {hotline}</span>
              </a>
              <span className="text-[10px] bg-[#cc272d] text-white px-2 py-0.5 rounded-full font-bold">
                24/7 Call
              </span>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Main Links */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Navigation Menu
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
                  <span>Product Categories</span>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[10px] text-[#cc272d] font-bold"
                  >
                    View All →
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
                <span>My Account & Track Order</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
