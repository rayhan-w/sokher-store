import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFD] flex flex-col">
      <AnnouncementBar settings={{ isAnnouncementActive: true, freeDeliveryThreshold: 999 }} />
      <Header settings={{ storeName: 'Sokher Store' }} categories={[]} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#cc272d] uppercase tracking-widest">
            About Sokher Store
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            Your Beauty, Our Passion
          </h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            শখের স্টোর বাংলাদেশের একটি নির্ভরযোগ্য প্রিমিয়াম অনলাইন কসমেটিকস ও রূপচর্চা পণ্য বিপণন প্ল্যাটফর্ম।
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-bold text-gray-900">আমাদের প্রতিশ্রুতি ও লক্ষ্য</h2>
          <p>
            আমরা বিশ্বাস করি প্রতিটি নারী ও পুরুষের প্রাকৃতিক সৌন্দর্য অমূল্য। সঠিক ও খাঁটি প্রসাধন ব্যবহারের মাধ্যমে আপনার আত্মবিশ্বাস বৃদ্ধি করাই আমাদের মূল লক্ষ্য। শখের স্টোর থেকে অর্ডারকৃত প্রতিটি পণ্য সরাসরি অফিসিয়াল পরিবেশক ও অনুমোদিত সোর্স থেকে সংগৃহীত।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#cc272d]" />
              <h3 className="font-bold text-gray-900">১০০% আসল পণ্য</h3>
              <p className="text-[11px] text-gray-500">কোনো নকল বা মেয়াদোত্তীর্ণ পণ্য আমাদের স্টোরে বিক্রি করা হয় না।</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <Sparkles className="w-6 h-6 text-[#cc272d]" />
              <h3 className="font-bold text-gray-900">দ্রুততম হোম ডেলিভারি</h3>
              <p className="text-[11px] text-gray-500">ঢাকা সিটিতে ২৪-৪৮ ঘণ্টার মধ্যে এবং সারা দেশে সর্বোচ্চ ৩-৪ দিনে ডেলিভারি।</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
              <Heart className="w-6 h-6 text-[#cc272d]" />
              <h3 className="font-bold text-gray-900">২৪/৭ গ্রাহক সেবা</h3>
              <p className="text-[11px] text-gray-500">যেকোনো প্রশ্ন বা পরামর্শের জন্য আমাদের হেল্পলাইন ও AI অ্যাসিস্ট্যান্ট প্রস্তুত।</p>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={{ storeName: 'Sokher Store' }} />
    </div>
  );
}
