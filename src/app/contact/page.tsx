import React from 'react';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <AnnouncementBar settings={{ isAnnouncementActive: true, freeDeliveryThreshold: 999 }} />
      <Header settings={{ storeName: 'Sokher Store' }} categories={[]} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            Contact Sokher Store
          </h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Get in touch with us for product inquiries, order updates, or wholesale assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#cc272d] flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Phone & Helpline</h3>
            <p className="text-xs text-gray-500 font-mono">+880 1700-000000</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#cc272d] flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Email Support</h3>
            <p className="text-xs text-gray-500 font-mono">support@sokherstore.com</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#cc272d] flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Head Office</h3>
            <p className="text-xs text-gray-500">Mirpur, Dhaka - 1216, Bangladesh</p>
          </div>
        </div>
      </main>

      <Footer settings={{ storeName: 'Sokher Store' }} />
    </div>
  );
}
