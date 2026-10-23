'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/price-parser';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscountCap, setMaxDiscountCap] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {}
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setLoading(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          discountType,
          discountValue,
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
          maxDiscountCap: maxDiscountCap ? parseFloat(maxDiscountCap) : null,
        }),
      });

      if (res.ok) {
        setCode('');
        setDiscountValue('');
        setMinOrderAmount('');
        setMaxDiscountCap('');
        setToast('কুপন তৈরি সম্পন্ন হয়েছে!');
        setTimeout(() => setToast(null), 3000);
        fetchCoupons();
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Coupons & Promotions</h1>
        <p className="text-xs text-gray-500 mt-1">Manage discount vouchers, rules, and usage limits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Create New Coupon
          </h2>

          <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. SOKHER15"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl uppercase font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (৳)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Discount Value *</label>
                <input
                  type="number"
                  required
                  placeholder={discountType === 'PERCENTAGE' ? '15%' : '100৳'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Min Order (৳)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Max Cap (৳)</label>
                <input
                  type="number"
                  placeholder="200"
                  value={maxDiscountCap}
                  onChange={(e) => setMaxDiscountCap(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#cc272d] hover:bg-red-700 text-white font-bold rounded-xl transition"
            >
              {loading ? 'তৈরি হচ্ছে...' : 'Create Coupon'}
            </button>
          </form>
        </div>

        {/* Existing Coupons List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Active Coupons ({coupons.length})
          </h2>

          <div className="divide-y divide-gray-100">
            {coupons.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900 text-sm">{c.code}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-[#cc272d]">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Min Order: ৳{c.minOrderAmount || 0} {c.maxDiscountCap ? `• Max: ৳${c.maxDiscountCap}` : ''} • Used: {c.usageCount} times
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
