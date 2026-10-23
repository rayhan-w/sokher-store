'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

interface TrackingProps {
  metaPixelId?: string | null;
  ga4MeasurementId?: string | null;
  gtmContainerId?: string | null;
}

export default function TrackingScripts({ metaPixelId, ga4MeasurementId, gtmContainerId }: TrackingProps) {
  const pathname = usePathname();

  // Validate presence - If blank, NO script is rendered!
  const hasPixel = Boolean(metaPixelId && /^\d+$/.test(metaPixelId.trim()));
  const hasGa4 = Boolean(ga4MeasurementId && /^G-[A-Z0-9]+/i.test(ga4MeasurementId.trim()));
  const hasGtm = Boolean(gtmContainerId && /^GTM-[A-Z0-9]+/i.test(gtmContainerId.trim()));

  // Trigger PageView on route changes
  useEffect(() => {
    const eventId = `pageview_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Browser Meta Pixel
    if (hasPixel && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView', {}, { eventID: eventId });
    }

    // 2. GA4 Page View
    if (hasGa4 && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', ga4MeasurementId, {
        page_path: pathname,
      });
    }

    // 3. Server-side CAPI PageView
    if (hasPixel) {
      fetch('/api/tracking/capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'PageView',
          eventId,
          sourceUrl: window.location.href,
        }),
      }).catch(() => {});
    }
  }, [pathname, hasPixel, hasGa4, ga4MeasurementId]);

  return (
    <>
      {/* Google Tag Manager (GTM) - Only loaded if valid GTM ID exists */}
      {hasGtm && (
        <>
          <Script id="gtm-script" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmContainerId?.trim()}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId?.trim()}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 (GA4) - Only loaded if valid G- ID exists */}
      {hasGa4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId?.trim()}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4MeasurementId?.trim()}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel - Only loaded if numeric ID exists */}
      {hasPixel && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId?.trim()}');
          `}
        </Script>
      )}
    </>
  );
}
