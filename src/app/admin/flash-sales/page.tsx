'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Plus, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/price-parser';

export default function AdminFlashSalesPage() {
  const [activeSale, setActiveSale] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [title, setTitle] = useState('Weekend Beauty Bonanza');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [dealDiscountPercent, setDealDiscountPercent] = useState('25');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/flash-sales')
      .then((res) => res.json())
      .then((data) => setActiveSale(data.flashSale || null))
      .catch(() => {});

    fetch('/api/products?limit=50&status=ACTIVE')
      .then((res) => res.json())
      .then((data) => {
        const prods = data.products || [];
        setProducts(prods);
        if (prods.length > 0) {
          setSelectedProductIds(prods.slice(0, 3).map((p: any) => p.id));
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedProductIds.length === 0) return;

    setLoading(true);
    try {
      const discount = parseFloat(dealDiscountPercent) || 20;

      const items = selectedProductIds.map((pId) => {
        const prod = products.find((p) => p.id === pId);
        const originalPrice = prod ? prod.price : 500;
        const salePrice = Math.round(originalPrice * (1 - discount / 100));
        return {
          productId: pId,
          salePrice,
          stockLimit: 20,
        };
      });

      const res = await fetch('/api/flash-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          items,
        }),
      });

      if (res.ok) {
        setToast('ফ্ল্যাশ সেল সফলভাবে সক্রিয় করা হয়েছে!');
        setTimeout(() => setToast(null), 3500);
        const ref = await fetch('/api/flash-sales');
        const refData = await ref.json();
        setActiveSale(refData.flashSale || null);
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
        <h1 className="text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
          <Flame className="w-7 h-7 text-[#cc272d]" />
          <span>Flash Sale Manager</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Set up countdown flash sales that automatically expire
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Flash Sale Creation Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Schedule New Flash Sale
          </h2>

          <form onSubmit={handleCreateSale} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Deal Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Discount (% OFF)</label>
              <input
                type="number"
                min="5"
                max="80"
                value={dealDiscountPercent}
                onChange={(e) => setDealDiscountPercent(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#cc272d]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Select Products for Deal:</label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 rounded-xl p-2 bg-gray-50">
                {products.map((p) => {
                  const checked = selectedProductIds.includes(p.id);
                  return (
                    <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedProductIds((prev) =>
                            prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                          );
                        }}
                        className="rounded text-[#cc272d]"
                      />
                      <span className="truncate flex-1 font-medium text-gray-800">{p.name}</span>
                      <span className="font-bold text-gray-900">{formatPrice(p.price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#cc272d] hover:bg-red-700 text-white font-bold rounded-xl transition shadow-md"
            >
              {loading ? 'লঞ্চ হচ্ছে...' : 'Launch Flash Sale'}
            </button>
          </form>
        </div>

        {/* Currently Active Sale Display */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Currently Active Flash Sale
          </h2>

          {activeSale ? (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-gray-900 space-y-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#cc272d] text-white">LIVE</span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{activeSale.title}</h3>
                <p className="text-gray-500">
                  Ends: {new Date(activeSale.endTime).toLocaleString('bn-BD')}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gray-800">Included Deal Products:</h4>
                {activeSale.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between p-2 rounded-lg bg-gray-50">
                    <span className="truncate max-w-xs">{it.product?.name}</span>
                    <span className="font-bold text-[#cc272d]">{formatPrice(it.salePrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">বর্তমানে কোনো লাইভ ফ্ল্যাশ সেল চলছে না।</p>
          )}
        </div>
      </div>
    </div>
  );
}
