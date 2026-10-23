import React from 'react';
import prisma from '@/lib/prisma';
import { Star, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: true },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Customer Reviews</h1>
        <p className="text-xs text-gray-500 mt-1">Review feedback and manage approvals</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Comment</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-rose-50/20 transition">
                <td className="py-3.5 px-4 font-bold text-gray-900 max-w-xs truncate">
                  {r.product?.name}
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold">{r.customerName}</span>
                  {r.isVerified && (
                    <span className="block text-[10px] text-emerald-600 font-bold">Verified</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{r.rating}.0</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-gray-700 max-w-sm">
                  {r.comment}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
