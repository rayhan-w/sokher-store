'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '@/lib/price-parser';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalOrders: number;
    pendingDispatch: number;
    pendingPayments: number;
    lowStockCount: number;
    recentOrders: any[];
    popularProducts: any[];
  } | null>(null);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders?limit=100'),
        fetch('/api/products?limit=100&status=ALL'),
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      const orders = ordersData.orders || [];
      const products = productsData.products || [];

      // Definition: Revenue excludes cancelled orders!
      const validOrders = orders.filter((o: any) => o.orderStatus !== 'CANCELLED');
      const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

      const pendingDispatch = orders.filter((o: any) =>
        ['PENDING', 'CONFIRMED', 'PACKED'].includes(o.orderStatus)
      ).length;

      const pendingPayments = orders.filter(
        (o: any) => o.paymentMethod !== 'COD' && o.paymentStatus === 'PENDING'
      ).length;

      const lowStockCount = products.filter((p: any) => p.stock < 15).length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        pendingDispatch,
        pendingPayments,
        lowStockCount,
        recentOrders: orders.slice(0, 6),
        popularProducts: products.sort((a: any, b: any) => b.viewCount - a.viewCount).slice(0, 5),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFetchAiInsight = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/insight');
      const data = await res.json();
      setAiInsight(data.insight);
    } catch {
      setAiInsight('AI ইনসাইট লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-8 text-center text-xs text-gray-500">
        ড্যাশবোর্ড ডেটা লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Title & AI Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">Admin Overview</h1>
          <p className="text-xs text-gray-500 mt-1">
            Store performance, live orders, and product stock status
          </p>
        </div>

        <button
          onClick={handleFetchAiInsight}
          disabled={loadingAi}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-[#cc272d] text-white text-xs font-bold shadow-md shadow-red-600/20 hover:scale-102 transition"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{loadingAi ? 'AI বিশ্লেষণ হচ্ছে...' : 'AI Sales Insight'}</span>
        </button>
      </div>

      {/* AI Insight Box */}
      {aiInsight && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border border-rose-200 text-xs sm:text-sm text-gray-800 leading-relaxed shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-bold text-[#cc272d] mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>AI Executive Summary</span>
          </div>
          <p className="whitespace-pre-wrap">{aiInsight}</p>
        </div>
      )}

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ৳
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900">
            {formatPrice(stats.totalRevenue)}
          </p>
          <p className="text-[10px] text-gray-400">Excludes cancelled orders</p>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.totalOrders}</p>
          <p className="text-[10px] text-gray-400">Lifetime orders placed</p>
        </div>

        {/* Metric 3: Pending Dispatch */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Pending Dispatch</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600">{stats.pendingDispatch}</p>
          <p className="text-[10px] text-gray-400">Needs packing / courier</p>
        </div>

        {/* Metric 4: Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Verify Payments</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-600">{stats.pendingPayments}</p>
          <p className="text-[10px] text-gray-400">bKash/Nagad TrxID check</p>
        </div>

        {/* Metric 5: Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Low Stock Alert</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#cc272d] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#cc272d]">{stats.lowStockCount}</p>
          <p className="text-[10px] text-gray-400">Products with stock &lt; 15</p>
        </div>
      </div>

      {/* Grid: Recent Orders & Best Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Orders */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Recent Customer Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#cc272d] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {stats.recentOrders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">এখনো কোনো অর্ডার আসেনি।</p>
            ) : (
              stats.recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs gap-3">
                  <div>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-bold text-gray-900 hover:text-[#cc272d] transition"
                    >
                      #{o.orderNumber}
                    </Link>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {o.customerName} ({o.customerPhone})
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[#cc272d]">{formatPrice(o.totalAmount)}</p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-0.5 ${
                        o.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.orderStatus === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Best Selling / Popular Products */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Popular Products</h2>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-[#cc272d] hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {stats.popularProducts.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{p.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">SKU: {p.sku}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">{formatPrice(p.price)}</p>
                  <span
                    className={`inline-block text-[10px] font-semibold ${
                      p.stock < 15 ? 'text-red-600 font-bold' : 'text-emerald-600'
                    }`}
                  >
                    Stock: {p.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
