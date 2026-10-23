'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/price-parser';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Delete Modal State (Rule #3)
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?page=${page}&limit=20&status=${statusFilter}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Rule #3: Delete Confirmation + Success Toast
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setToastMessage(`"${productToDelete.name}" সফলভাবে মুছে ফেলা হয়েছে।`);
        setProductToDelete(null);
        fetchProducts(); // Refresh list immediately
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(data.error || 'ডিলিট করতে সমস্যা হয়েছে।');
      }
    } catch {
      alert('সার্ভারে সমস্যা হয়েছে।');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">Product Catalogue</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total {totalCount} products registered in the database
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
          <span className="text-gray-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl py-1.5 px-3 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DRAFT">Draft Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Categories</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    পণ্য তালিকা লোড হচ্ছে...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    কোনো পণ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const img = p.images?.[0] || '/images/logo-icon.jpg';
                  return (
                    <tr key={p.id} className="hover:bg-rose-50/20 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                            <Image src={img} alt={p.name} fill className="object-contain p-0.5" />
                          </div>
                          <div>
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="font-bold text-gray-900 hover:text-[#cc272d] transition line-clamp-1 max-w-xs"
                            >
                              {p.name}
                            </Link>
                            {p.badge && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#cc272d] text-white mt-0.5">
                                {p.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-gray-700">
                        {p.sku}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{formatPrice(p.price)}</div>
                        {p.regularPrice && (
                          <div className="text-[10px] text-gray-400 line-through">
                            {formatPrice(p.regularPrice)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            p.stock <= 5 ? 'text-red-600' : p.stock < 15 ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        {p.categories?.map((c: any) => c.name).join(', ') || 'Uncategorized'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/edit/${p.id}`}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Rule #3: Open Delete Confirmation Dialog */}
                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal (Rule #3: Delete-e oboshoi confirmation dialog + success toast asbe) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                পণ্যটি মুছে ফেলতে নিশ্চিত?
              </h3>
              <p className="text-xs text-gray-500">
                &ldquo;{productToDelete.name}&rdquo; (SKU: {productToDelete.sku}) স্থায়ীভাবে ডেটাবেস থেকে মুছে ফেলা হবে।
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
              >
                বাতিল করুন (Cancel)
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md disabled:opacity-40"
              >
                {deleteLoading ? 'ডিলিট হচ্ছে...' : 'হ্যাঁ, মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
