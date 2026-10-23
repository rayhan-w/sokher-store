'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Image as ImageIcon,
  Flame,
  Star,
  FileBarChart,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If user is accessing /admin/login, don't show the admin shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/admin/login');
      }
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xs">
        অ্যাডমিন প্যানেল লোড হচ্ছে...
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Banners & Sliders', href: '/admin/banners', icon: ImageIcon },
    { label: 'Flash Sale Deals', href: '/admin/flash-sales', icon: Flame },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Reports (CSV)', href: '/admin/reports', icon: FileBarChart },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-gray-950 text-white p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#cc272d] flex items-center justify-center font-black">
            S
          </div>
          <span className="font-bold text-sm tracking-tight">Sokher Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 text-gray-400 hover:text-white"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 text-gray-300 flex flex-col justify-between p-5 border-r border-gray-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-800">
            <div className="w-9 h-9 rounded-xl bg-[#cc272d] text-white flex items-center justify-center font-black text-lg shadow-md shadow-red-600/30">
              S
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight leading-none">
                Sokher Store
              </h2>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition ${
                    isActive
                      ? 'bg-[#cc272d] text-white font-bold shadow-md shadow-red-600/20'
                      : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-semibold transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-rose-400" />
              <span>View Storefront</span>
            </span>
            <span className="text-[10px] text-gray-500">Live ↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl hover:bg-red-950/40 text-red-400 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Welcome, </span>
            <strong className="text-gray-900 font-bold">{user.name}</strong>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              Super Admin
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 font-semibold text-gray-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#cc272d]" />
              <span>Open Storefront</span>
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
