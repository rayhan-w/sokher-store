import React from 'react';
import prisma from '@/lib/prisma';
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/price-parser';

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        where: { orderStatus: { not: 'CANCELLED' } }, // Excludes cancelled orders!
        select: { totalAmount: true },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Registered Customers</h1>
        <p className="text-xs text-gray-500 mt-1">
          Total {users.length} registered accounts
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Customer Name</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Orders Count</th>
              <th className="py-3.5 px-4 text-right">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const spent = u.orders.reduce((sum, o) => sum + o.totalAmount, 0);
              return (
                <tr key={u.id} className="hover:bg-rose-50/20 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">{u.name}</div>
                    <div className="text-[10px] text-gray-400">
                      Joined {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <div>{u.email}</div>
                    {u.phone && <div className="text-[11px] text-gray-400">{u.phone}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    {u.orders.length}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#cc272d]">
                    {formatPrice(spent)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
