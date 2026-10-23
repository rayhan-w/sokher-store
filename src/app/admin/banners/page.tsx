'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [type, setType] = useState('HERO_SLIDER');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonUrl, setButtonUrl] = useState('/shop');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch {}
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, subtitle, badge, buttonText, buttonUrl, imageUrl }),
      });

      if (res.ok) {
        setTitle('');
        setSubtitle('');
        setImageUrl('');
        setToast('ব্যানার সফলভাবে যোগ হয়েছে!');
        setTimeout(() => setToast(null), 3000);
        fetchBanners();
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
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Banners & Hero Sliders</h1>
        <p className="text-xs text-gray-500 mt-1">
          Customize the visual promotional banners on the homepage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Add New Banner / Slide
          </h2>

          <form onSubmit={handleCreateBanner} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Banner Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
              >
                <option value="HERO_SLIDER">Hero Slider (শীর্ষ স্লাইডার)</option>
                <option value="PROMO_BANNER">Promotional Banner (নিচের ব্যানার)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Badge Text</label>
              <input
                type="text"
                placeholder="e.g. BEAUTY • SKINCARE"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Headline Title</label>
              <input
                type="text"
                placeholder="e.g. Your Beauty, Our Passion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                placeholder="e.g. Discover premium cosmetics..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Image URL *</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Button Link</label>
                <input
                  type="text"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#cc272d] hover:bg-red-700 text-white font-bold rounded-xl transition"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'Add Banner'}
            </button>
          </form>
        </div>

        {/* Existing Banners */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Current Banners ({banners.length})
          </h2>

          <div className="space-y-4">
            {banners.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 flex gap-4 items-center">
                <div className="relative w-24 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <Image src={b.imageUrl} alt={b.title || 'Banner'} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <span className="text-[10px] font-bold text-[#cc272d] uppercase">{b.type}</span>
                  <h4 className="font-bold text-gray-900 truncate">{b.title}</h4>
                  <p className="text-[11px] text-gray-500 truncate">{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
