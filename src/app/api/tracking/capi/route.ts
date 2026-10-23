import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMetaCapiEvent } from '@/lib/tracking';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventName, eventId, sourceUrl, userData, customData } = body;

    const settings = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
      select: { metaPixelId: true, metaCapiToken: true },
    });

    if (!settings?.metaPixelId || !settings?.metaCapiToken) {
      return NextResponse.json({ skipped: true, reason: 'Pixel or CAPI token not set in Settings.' });
    }

    const result = await sendMetaCapiEvent({
      eventName,
      eventId,
      sourceUrl,
      userData,
      customData,
      pixelId: settings.metaPixelId,
      accessToken: settings.metaCapiToken,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
