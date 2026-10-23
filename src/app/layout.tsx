import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import CartDrawer from '@/components/CartDrawer';
import MobileBottomNav from '@/components/MobileBottomNav';
import AiShoppingAssistant from '@/components/AiShoppingAssistant';
import TrackingScripts from '@/components/TrackingScripts';
import prisma from '@/lib/prisma';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.storeSetting.findUnique({
    where: { id: 'default' },
  }).catch(() => null);

  return {
    title: settings?.storeName ? `${settings.storeName} — Your Beauty, Our Passion` : 'Sokher Store',
    description: settings?.tagline || '100% authentic cosmetics, skincare and beauty care products in Bangladesh.',
    icons: {
      icon: settings?.faviconUrl || '/images/logo-icon.jpg',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.storeSetting.findUnique({
    where: { id: 'default' },
  }).catch(() => null);

  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white selection:bg-rose-100 selection:text-[#cc272d]">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {/* Tracking Scripts (Omitted if IDs blank) */}
              <TrackingScripts
                metaPixelId={settings?.metaPixelId}
                ga4MeasurementId={settings?.ga4MeasurementId}
                gtmContainerId={settings?.gtmContainerId}
              />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">{children}</div>

              {/* Global Interactive Overlays */}
              <CartDrawer />
              <MobileBottomNav />
              <AiShoppingAssistant />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
