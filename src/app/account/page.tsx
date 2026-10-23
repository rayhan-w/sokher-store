'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Heart, LogOut, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/price-parser';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []))
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xs text-gray-500">লোড হচ্ছে...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
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
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <AnnouncementBar settings={{ isAnnouncementActive: true, freeDeliveryThreshold: 999 }} />
      <Header settings={{ storeName: 'Sokher Store' }} categories={[]} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: User Profile Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#cc272d] flex items-center justify-center font-bold text-xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{user.name}</h2>
                <p className="text-xs text-gray-500">{user.email}</p>
                {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <Link
                href="/account/wishlist"
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-xs font-semibold text-gray-700 hover:text-[#cc272d] transition"
              >
                <Heart className="w-4 h-4" />
                <span>My Wishlist</span>
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 text-[#cc272d] text-xs font-bold transition"
                >
                  <Package className="w-4 h-4" />
                  <span>Go to Admin Panel →</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-xs font-semibold text-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right: Order History */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#cc272d]" />
              <span>Your Orders ({orders.length})</span>
            </h2>

            {ordersLoading ? (
              <p className="text-xs text-gray-400">অর্ডার লোড হচ্ছে...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Clock className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs sm:text-sm text-gray-500">আপনার কোনো আগের অর্ডার পাওয়া যায়নি।</p>
                <Link
                  href="/shop"
                  className="inline-block px-6 py-2.5 rounded-full bg-[#cc272d] text-white text-xs font-semibold"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-900">
                          Order #{o.orderNumber}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          Placed on: {new Date(o.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(o.orderStatus)}
                        <span className="text-xs font-bold text-[#cc272d]">
                          {formatPrice(o.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Items Snapshot */}
                    <div className="space-y-2">
                      {o.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-800">
                            • {item.productName} ({item.productSku || 'SKU'}) × {item.quantity}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span>Delivery Zone: {o.deliveryZone}</span>
                      <span>Payment: {o.paymentMethod} ({o.paymentStatus})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer settings={{ storeName: 'Sokher Store' }} />
    </div>
  );
}
