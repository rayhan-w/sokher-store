'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2, Sparkles, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialProduct?: any;
  categories: any[];
}

export default function ProductFormClient({ initialProduct, categories }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialProduct);

  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [price, setPrice] = useState(initialProduct?.price ? String(initialProduct.price) : '');
  const [regularPrice, setRegularPrice] = useState(
    initialProduct?.regularPrice ? String(initialProduct.regularPrice) : ''
  );
  const [stock, setStock] = useState(initialProduct?.stock !== undefined ? String(initialProduct.stock) : '50');
  const [badge, setBadge] = useState(initialProduct?.badge || '');
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured || false);
  const [status, setStatus] = useState(initialProduct?.status || 'ACTIVE');

  // Category Multi-select & Subcategory
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialProduct?.categories?.map((c: any) => c.id || c.categoryId) || []
  );
  const [subcategoryId, setSubcategoryId] = useState<string>(initialProduct?.subcategoryId || '');

  // Images
  const [images, setImages] = useState<string[]>(
    initialProduct?.images || ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800']
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  // Description & AI
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoDescription || '');

  // Specs
  const [specs, setSpecs] = useState<Array<{ key: string; val: string }>>(() => {
    if (initialProduct?.specification && typeof initialProduct.specification === 'object') {
      return Object.entries(initialProduct.specification).map(([key, val]) => ({
        key,
        val: String(val),
      }));
    }
    return [
      { key: 'Brand', val: '' },
      { key: 'Weight / Volume', val: '' },
      { key: 'Country of Origin', val: '' },
    ];
  });

  const [loading, setLoading] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-generate slug from name on Add
  useEffect(() => {
    if (!isEdit && name && !slug) {
      setSlug(
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  }, [name, isEdit, slug]);

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAiGenerateDescription = async () => {
    if (!name.trim()) {
      setErrorMsg('AI ডেসক্রিপশন তৈরি করার জন্য প্রথমে পণ্যের নাম লিখুন।');
      return;
    }

    setLoadingAi(true);
    setErrorMsg('');
    try {
      const selectedCatNames = categories
        .filter((c) => selectedCategoryIds.includes(c.id))
        .map((c) => c.name)
        .join(', ');

      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: selectedCatNames || 'Cosmetics',
        }),
      });

      const data = await res.json();
      if (data.descriptions) {
        const fullDesc = `${data.descriptions.bangla}\n\n${data.descriptions.english}`;
        setDescription(fullDesc);
        if (!seoTitle) setSeoTitle(`${name} - Buy Authentic at Sokher Store BD`);
        if (!seoDescription) setSeoDescription(data.descriptions.bangla.slice(0, 150));
      }
    } catch {
      setErrorMsg('AI ডেসক্রিপশন জেনারেট করতে সমস্যা হয়েছে।');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Format specifications
    const formattedSpecs: { [key: string]: string } = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.val.trim()) {
        formattedSpecs[s.key.trim()] = s.val.trim();
      }
    });

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      sku: sku.trim(),
      price,
      regularPrice: regularPrice.trim() ? regularPrice : null,
      stock: parseInt(stock) || 0,
      badge: badge.trim() || null,
      isFeatured,
      status,
      categoryIds: selectedCategoryIds,
      subcategoryId: subcategoryId || null,
      images,
      description: description.trim() || null,
      specification: Object.keys(formattedSpecs).length > 0 ? formattedSpecs : null,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
    };

    setLoading(true);

    try {
      const url = isEdit ? `/api/products/${initialProduct.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'পণ্য সংরক্ষণ করা যায়নি।');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'পণ্য সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch {
      setErrorMsg('সার্ভারে সমস্যা হয়েছে।');
      setLoading(false);
    }
  };

  // Get available subcategories for selected categories
  const availableSubcategories = categories
    .filter((c) => selectedCategoryIds.includes(c.id))
    .flatMap((c) => c.subcategories || []);

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-40"
        >
          {loading ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'Update Product' : 'Save Product'}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Basic Details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">
              Product Name (পণ্যের নাম) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pond's Bright Beauty Day Cream"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              SKU (ইউনিক পণ্য কোড) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. PND-BB-50G"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Slug (ইউনিক URL লিংক)
            </label>
            <input
              type="text"
              placeholder="e.g. ponds-bright-beauty-day-cream"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
          </div>
        </div>
      </div>

      {/* 2. Pricing & Inventory (Rule #1: Price parser protection) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
          Pricing & Stock (মূল্য ও ইনভেন্টরি)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Selling Price (বিক্রয় মূল্য ৳) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 1,200 or 1200 or ১২০০"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-bold text-gray-900"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">কমা, স্পেস বা বাংলা সংখ্যা সমর্থন করে</span>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Regular Price (কাটা দাগের আগের দাম ৳)
            </label>
            <input
              type="text"
              placeholder="e.g. 1,450 (ঐচ্ছিক)"
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">ছাড়ের % স্বয়ংক্রিয়ভাবে হিসাব হবে</span>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Stock Quantity (মজুদ সংখ্যা) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Badge (লেবেল)</label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            >
              <option value="">None</option>
              <option value="Best Seller">Best Seller</option>
              <option value="New">New</option>
              <option value="Hot">Hot</option>
              <option value="Trending">Trending</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            >
              <option value="ACTIVE">Active (Live in Store)</option>
              <option value="DRAFT">Draft (Hidden)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-[#cc272d] rounded focus:ring-[#cc272d]"
            />
            <label htmlFor="isFeatured" className="font-semibold text-gray-700 cursor-pointer">
              Feature on Homepage
            </label>
          </div>
        </div>
      </div>

      {/* 3. Category Multi-select & Subcategory (Rule #2) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
          Categories & Subcategory (ক্যাটাগরি নির্বাচন)
        </h2>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700">
            Select Categories (একাধিক নির্বাচন করা যাবে):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {categories.map((cat) => {
              const checked = selectedCategoryIds.includes(cat.id);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition ${
                    checked
                      ? 'border-[#cc272d] bg-rose-50 text-[#cc272d]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {availableSubcategories.length > 0 && (
          <div className="pt-2 text-xs">
            <label className="block font-semibold text-gray-700 mb-1">
              Select Subcategory (সাবক্যাটাগরি - ঐচ্ছিক)
            </label>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className="w-full sm:w-80 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            >
              <option value="">None (কোনোটি নয়)</option>
              {availableSubcategories.map((sub: any) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4. Product Images */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
          Product Images (পণ্যের ছবি)
        </h2>

        {/* Existing Images Preview */}
        <div className="flex flex-wrap gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden group"
            >
              <Image src={img} alt="Product preview" fill className="object-contain p-1" />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-gray-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Add New Image URL */}
        <div className="flex gap-2 pt-2 text-xs">
          <input
            type="url"
            placeholder="Paste Image URL (https://...)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition"
          >
            Add Image
          </button>
        </div>
      </div>

      {/* 5. Description & AI Generator */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Product Description (বিস্তারিত বিবরণ)
          </h2>

          <button
            type="button"
            onClick={handleAiGenerateDescription}
            disabled={loadingAi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-[#cc272d] hover:bg-rose-100 text-xs font-bold transition border border-rose-100"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingAi ? 'AI লিখছে...' : 'AI Generate Description'}</span>
          </button>
        </div>

        <textarea
          rows={6}
          placeholder="পণ্যের বিস্তারিত উপকারিতা এবং ব্যবহারের নিয়ম লিখুন..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
        />
      </div>

      {/* 6. Specifications Key-Value Pairs */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Specifications (বৈশিষ্ট্যাবলী)
          </h2>
          <button
            type="button"
            onClick={() => setSpecs([...specs, { key: '', val: '' }])}
            className="text-xs font-bold text-[#cc272d] hover:underline"
          >
            + Add Spec Row
          </button>
        </div>

        <div className="space-y-2">
          {specs.map((s, idx) => (
            <div key={idx} className="flex gap-3 text-xs items-center">
              <input
                type="text"
                placeholder="Attribute (e.g. Brand)"
                value={s.key}
                onChange={(e) => {
                  const next = [...specs];
                  next[idx].key = e.target.value;
                  setSpecs(next);
                }}
                className="w-1/3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              />
              <input
                type="text"
                placeholder="Value (e.g. Pond's)"
                value={s.val}
                onChange={(e) => {
                  const next = [...specs];
                  next[idx].val = e.target.value;
                  setSpecs(next);
                }}
                className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. SEO Metadata */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
          Search Engine Optimization (SEO)
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">SEO Meta Title</label>
            <input
              type="text"
              placeholder="e.g. Buy Pond's Bright Beauty Day Cream in Bangladesh"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">SEO Meta Description</label>
            <textarea
              rows={2}
              placeholder="Google সার্চ রেজাল্টে যে বিবরণ প্রদর্শিত হবে..."
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
