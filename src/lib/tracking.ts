/**
 * Tracking & Analytics Wiring (Meta Pixel, Server CAPI, GA4, GTM)
 * Enforces:
 * - Format validations (G- for GA4, GTM- for GTM, numbers for Pixel)
 * - Safe omitting when ID is blank
 * - Event de-duplication using matching event_id between browser and CAPI
 */

export interface TrackingSettings {
  metaPixelId?: string | null;
  metaCapiToken?: string | null;
  ga4MeasurementId?: string | null;
  gtmContainerId?: string | null;
}

export function validateTrackingId(type: 'pixel' | 'capi' | 'ga4' | 'gtm', value?: string | null): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: true }; // Blank is permitted and disables that tracker
  }

  const trimmed = value.trim();

  if (type === 'pixel') {
    if (!/^\d{8,20}$/.test(trimmed)) {
      return { valid: false, error: 'Meta Pixel ID শুধুমাত্র ৮-২০ ডিজিটের সংখ্যা হতে হবে (Pixel ID must be numeric).' };
    }
  }

  if (type === 'ga4') {
    if (!/^G-[A-Z0-9]{6,14}$/i.test(trimmed)) {
      return { valid: false, error: 'GA4 Measurement ID অবশ্যই "G-" দিয়ে শুরু হতে হবে (e.g. G-XXXXXXX).' };
    }
  }

  if (type === 'gtm') {
    if (!/^GTM-[A-Z0-9]{5,10}$/i.test(trimmed)) {
      return { valid: false, error: 'GTM Container ID অবশ্যই "GTM-" দিয়ে শুরু হতে হবে (e.g. GTM-XXXXXXX).' };
    }
  }

  return { valid: true };
}

/**
 * Sends a server-side Conversions API (CAPI) event to Meta
 */
export async function sendMetaCapiEvent(params: {
  eventName: string;
  eventId: string;
  sourceUrl?: string;
  userData?: {
    email?: string;
    phone?: string;
    clientIp?: string;
    clientUserAgent?: string;
  };
  customData?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    order_id?: string;
  };
  pixelId?: string;
  accessToken?: string;
}) {
  const { eventName, eventId, sourceUrl, userData, customData, pixelId, accessToken } = params;

  if (!pixelId || !accessToken) {
    return { skipped: true, reason: 'Meta Pixel ID or CAPI Access Token not configured.' };
  }

  try {
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: sourceUrl || 'https://sokherstore.com',
          action_source: 'website',
          user_data: {
            client_ip_address: userData?.clientIp,
            client_user_agent: userData?.clientUserAgent,
            em: userData?.email ? [hashSha256(userData.email.toLowerCase().trim())] : undefined,
            ph: userData?.phone ? [hashSha256(userData.phone.replace(/[^0-9]/g, ''))] : undefined,
          },
          custom_data: customData,
        },
      ],
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (error: any) {
    console.error('CAPI Dispatch Error:', error.message);
    return { success: false, error: error.message };
  }
}

function hashSha256(input: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(input).digest('hex');
}
