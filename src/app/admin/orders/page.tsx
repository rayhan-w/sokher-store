'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Search, Filter } from 'lucide-react';
import { formatPrice } from '@/lib/price-parser';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/orders?page=${page}&limit=20&status=${statusFilter}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Shipped</span>;
      case 'PACKED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Packed</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">Confirmed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total {totalCount} orders received
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by order #, phone, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#cc272d] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    অর্ডার তালিকা লোড হচ্ছে...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-rose-50/20 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900 font-mono">
                      #{o.orderNumber}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString('bn-BD')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{o.customerName}</div>
                      <div className="text-[11px] text-gray-400">{o.customerPhone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {o.deliveryZone}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#cc272d]">
                      {formatPrice(o.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800">{o.paymentMethod}</span>
                      <span
                        className={`block text-[10px] font-bold ${
                          o.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(o.orderStatus)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 font-semibold text-gray-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#cc272d]" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
