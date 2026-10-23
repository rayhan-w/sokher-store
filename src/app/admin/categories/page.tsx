'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Subcategory Add Form
  const [activeCatForSub, setActiveCatForSub] = useState<string | null>(null);
  const [subName, setSubName] = useState('');

  // Delete Modal
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreateLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), image: image.trim(), description: description.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'ক্যাটাগরি তৈরি ব্যর্থ হয়েছে।');
      } else {
        setName('');
        setSlug('');
        setImage('');
        setDescription('');
        setToast('ক্যাটাগরি সফলভাবে তৈরি হয়েছে!');
        setTimeout(() => setToast(null), 3000);
        fetchCategories();
      }
    } catch {
      setErrorMsg('সার্ভারে সমস্যা হয়েছে।');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent, categoryId: string) => {
    e.preventDefault();
    if (!subName.trim()) return;

    try {
      const res = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subName.trim(), categoryId }),
      });
      if (res.ok) {
        setSubName('');
        setActiveCatForSub(null);
        fetchCategories();
      }
    } catch {}
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setToast(`"${categoryToDelete.name}" ক্যাটাগরি মুছে ফেলা হয়েছে (পণ্যগুলো সুরক্ষিত আছে)।`);
        setCategoryToDelete(null);
        fetchCategories();
        setTimeout(() => setToast(null), 3500);
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
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Categories & Subcategories</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage product classifications and hierarchies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Create Category Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Add New Category
          </h2>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lip Care"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                placeholder="e.g. lip-care (auto if empty)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Short overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
              />
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full py-2.5 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white font-bold transition disabled:opacity-40"
            >
              {createLoading ? 'তৈরি হচ্ছে...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Right: Existing Categories List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
            Existing Categories ({categories.length})
          </h2>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <p className="text-xs text-gray-400 py-6 text-center">ক্যাটাগরি লোড হচ্ছে...</p>
            ) : categories.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">কোনো ক্যাটাগরি তৈরি করা হয়নি।</p>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full bg-rose-50 border border-rose-100 overflow-hidden flex-shrink-0">
                        {c.image ? (
                          <Image src={c.image} alt={c.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[#cc272d]">
                            {c.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{c.name}</h4>
                        <span className="text-[11px] text-gray-400">
                          Slug: {c.slug} • {c.productCount} active products
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveCatForSub(activeCatForSub === c.id ? null : c.id)}
                        className="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-[11px] font-semibold text-gray-700"
                      >
                        + Subcategory
                      </button>

                      <button
                        onClick={() => setCategoryToDelete(c)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories list */}
                  {c.subcategories && c.subcategories.length > 0 && (
                    <div className="pl-13 flex flex-wrap gap-1.5 pt-1">
                      {c.subcategories.map((sub: any) => (
                        <span
                          key={sub.id}
                          className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-medium"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add subcategory input */}
                  {activeCatForSub === c.id && (
                    <form
                      onSubmit={(e) => handleAddSubcategory(e, c.id)}
                      className="pl-13 flex gap-2 pt-2 text-xs"
                    >
                      <input
                        type="text"
                        placeholder="Subcategory Name"
                        value={subName}
                        onChange={(e) => setSubName(e.target.value)}
                        className="p-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg flex-1"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-gray-900 text-white rounded-lg text-xs font-semibold"
                      >
                        Add
                      </button>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Category Modal (Reassigns products safely to Uncategorized) */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-gray-900">ক্যাটাগরি মুছে ফেলতে চান?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              &ldquo;{categoryToDelete.name}&rdquo; ক্যাটাগরি ডিলিট করলেও পণ্যগুলো মুছে যাবে না। সেগুলোকে
              স্বয়ংক্রিয়ভাবে &ldquo;Uncategorized&rdquo; ক্যাটাগরিতে নিরাপদে রেখে দেওয়া হবে।
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {deleteLoading ? 'ডিলিট হচ্ছে...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
