'use client';

import React from 'react';
import { Download, FileSpreadsheet, Package, ShoppingBag } from 'lucide-react';

export default function AdminReportsPage() {
  const downloadReport = (type: 'orders' | 'products') => {
    window.location.href = `/api/reports/export?type=${type}`;
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Reports & Data Export</h1>
        <p className="text-xs text-gray-500 mt-1">
          Export store sales, inventory, and order records as CSV for Excel analysis
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Orders Export Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#cc272d] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Orders & Sales Report</h3>
            <p className="text-xs text-gray-500 mt-1">
              Complete customer order log with order numbers, customer phones, zones, payment methods, delivery charges, and total revenue.
            </p>
          </div>
          <button
            onClick={() => downloadReport('orders')}
            className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Orders CSV</span>
          </button>
        </div>

        {/* Products Export Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Products & Inventory Report</h3>
            <p className="text-xs text-gray-500 mt-1">
              Full product inventory snapshot with SKUs, current prices, regular prices, stock levels, badges, and catalog statuses.
            </p>
          </div>
          <button
            onClick={() => downloadReport('products')}
            className="w-full py-3 px-4 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Products CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
