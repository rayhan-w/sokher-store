'use client';

import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, AlertCircle, Shield, Truck, CreditCard, Activity } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [storeName, setStoreName] = useState('Sokher Store');
  const [tagline, setTagline] = useState('Your Beauty, Our Passion');
  const [logoUrl, setLogoUrl] = useState('/images/logo-icon.jpg');
  const [primaryColor, setPrimaryColor] = useState('#e11d2e');
  const [announcementText, setAnnouncementText] = useState('');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true);

  // Delivery Charges (Single Source of Truth)
  const [deliveryDhaka, setDeliveryDhaka] = useState('70');
  const [deliveryDhakaSuburbs, setDeliveryDhakaSuburbs] = useState('100');
  const [deliveryOutsideDhaka, setDeliveryOutsideDhaka] = useState('130');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('999');

  // Contact
  const [contactPhone, setContactPhone] = useState('+880 1700-000000');
  const [contactEmail, setContactEmail] = useState('support@sokherstore.com');
  const [contactAddress, setContactAddress] = useState('Dhaka, Bangladesh');
  const [whatsappNumber, setWhatsappNumber] = useState('+880 1700-000000');

  // Social
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  // Payments (Masked display)
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');

  // Tracking
  const [metaPixelId, setMetaPixelId] = useState('');
  const [metaCapiToken, setMetaCapiToken] = useState('');
  const [ga4MeasurementId, setGa4MeasurementId] = useState('');
  const [gtmContainerId, setGtmContainerId] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings || {};
        setSettings(s);
        setStoreName(s.storeName || 'Sokher Store');
        setTagline(s.tagline || '');
        setLogoUrl(s.logoUrl || '/images/logo-icon.jpg');
        setPrimaryColor(s.primaryColor || '#e11d2e');
        setAnnouncementText(s.announcementText || '');
        setIsAnnouncementActive(s.isAnnouncementActive ?? true);

        setDeliveryDhaka(String(s.deliveryDhaka ?? 70));
        setDeliveryDhakaSuburbs(String(s.deliveryDhakaSuburbs ?? 100));
        setDeliveryOutsideDhaka(String(s.deliveryOutsideDhaka ?? 130));
        setFreeDeliveryThreshold(String(s.freeDeliveryThreshold ?? 999));

        setContactPhone(s.contactPhone || '');
        setContactEmail(s.contactEmail || '');
        setContactAddress(s.contactAddress || '');
        setWhatsappNumber(s.whatsappNumber || '');

        setFacebookUrl(s.facebookUrl || '');
        setInstagramUrl(s.instagramUrl || '');

        setBkashNumber(s.bkashNumber || '');
        setNagadNumber(s.nagadNumber || '');

        setMetaPixelId(s.metaPixelId || '');
        setMetaCapiToken(s.metaCapiTokenMasked || '');
        setGa4MeasurementId(s.ga4MeasurementId || '');
        setGtmContainerId(s.gtmContainerId || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const payload: any = {
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        logoUrl: logoUrl.trim(),
        primaryColor: primaryColor.trim(),
        announcementText: announcementText.trim(),
        isAnnouncementActive,
        deliveryDhaka: parseFloat(deliveryDhaka) || 0,
        deliveryDhakaSuburbs: parseFloat(deliveryDhakaSuburbs) || 0,
        deliveryOutsideDhaka: parseFloat(deliveryOutsideDhaka) || 0,
        freeDeliveryThreshold: parseFloat(freeDeliveryThreshold) || 0,
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        contactAddress: contactAddress.trim(),
        whatsappNumber: whatsappNumber.trim(),
        facebookUrl: facebookUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        bkashNumber: bkashNumber.trim(),
        nagadNumber: nagadNumber.trim(),
        metaPixelId: metaPixelId.trim() || null,
        ga4MeasurementId: ga4MeasurementId.trim() || null,
        gtmContainerId: gtmContainerId.trim() || null,
      };

      // If user typed a new CAPI token (not the masked placeholder)
      if (metaCapiToken && metaCapiToken !== 'Configured ✓' && metaCapiToken !== 'Not Configured') {
        payload.metaCapiToken = metaCapiToken.trim();
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।');
      } else {
        setToast('স্টোর সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
        setTimeout(() => setToast(null), 3500);
      }
    } catch {
      setErrorMsg('সার্ভারে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs text-gray-400">সেটিংস লোড হচ্ছে...</div>;
  }

  return (
    <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">Store Settings</h1>
          <p className="text-xs text-gray-500 mt-1">
            Global configuration for branding, delivery rates, payment & tracking
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#cc272d] hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 disabled:opacity-40"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'Save Settings'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Store Branding & Identity */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#cc272d]" />
          <span>Store Identity & Branding</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Tagline / Slogan</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Logo URL</label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Primary Brand Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-none"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl uppercase font-mono text-xs"
              />
            </div>
          </div>

          <div className="sm:col-span-2 pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-gray-700">Top Announcement Bar Text</label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={isAnnouncementActive}
                  onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                  className="rounded text-[#cc272d]"
                />
                <span>Active</span>
              </label>
            </div>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
          </div>
        </div>
      </div>

      {/* 2. Delivery Rates (Single Source of Truth) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#cc272d]" />
          <span>Delivery Rates & Free Shipping (একক উৎস)</span>
        </h2>

        <p className="text-xs text-gray-500">
          এই চার্জগুলোই কার্ট, চেকআউট, প্রোডাক্ট পেজ ও ফুটারে প্রদর্শিত হবে।
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Inside Dhaka (৳)</label>
            <input
              type="number"
              value={deliveryDhaka}
              onChange={(e) => setDeliveryDhaka(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Dhaka Suburbs (৳)</label>
            <input
              type="number"
              value={deliveryDhakaSuburbs}
              onChange={(e) => setDeliveryDhakaSuburbs(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Outside Dhaka (৳)</label>
            <input
              type="number"
              value={deliveryOutsideDhaka}
              onChange={(e) => setDeliveryOutsideDhaka(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Free Delivery Over (৳)</label>
            <input
              type="number"
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-bold text-emerald-700"
            />
          </div>
        </div>
      </div>

      {/* 3. Merchant Payment Accounts */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#cc272d]" />
          <span>Merchant Payment Numbers (বিকাশ ও নগদ নম্বর)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-pink-700 mb-1">Merchant bKash Number</label>
            <input
              type="tel"
              placeholder="017XXXXXXXX"
              value={bkashNumber}
              onChange={(e) => setBkashNumber(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-orange-700 mb-1">Merchant Nagad Number</label>
            <input
              type="tel"
              placeholder="018XXXXXXXX"
              value={nagadNumber}
              onChange={(e) => setNagadNumber(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4. Tracking & Analytics (Meta Pixel, CAPI, GA4, GTM) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#cc272d]" />
          <span>Tracking & Analytics Configuration</span>
        </h2>

        <p className="text-xs text-gray-500">
          Note: আইডি ফাঁকা থাকলে কোনো ট্র্যাকিং স্ক্রিপ্ট লোড হবে না। ভুল ফরম্যাট দিলে সেভ ব্লক হবে।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Meta Pixel ID (শুধুমাত্র সংখ্যা)
            </label>
            <input
              type="text"
              placeholder="e.g. 123456789012345"
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Meta CAPI Access Token (Server Masked)
            </label>
            <input
              type="password"
              placeholder={settings.isCapiConfigured ? 'Configured ✓' : 'Paste CAPI Access Token'}
              value={metaCapiToken}
              onChange={(e) => setMetaCapiToken(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              GA4 Measurement ID (&ldquo;G-&rdquo; দিয়ে শুরু)
            </label>
            <input
              type="text"
              placeholder="e.g. G-ABC123456"
              value={ga4MeasurementId}
              onChange={(e) => setGa4MeasurementId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              GTM Container ID (&ldquo;GTM-&rdquo; দিয়ে শুরু)
            </label>
            <input
              type="text"
              placeholder="e.g. GTM-XXXXXXX"
              value={gtmContainerId}
              onChange={(e) => setGtmContainerId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#cc272d] font-mono uppercase"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
