import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { validateTrackingId } from '@/lib/tracking';

export async function GET() {
  try {
    let settings = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: { id: 'default', storeName: 'Sokher Store' },
      });
    }

    // Return masked CAPI token and payment numbers for safety
    const maskedSettings = {
      ...settings,
      trustBarItems: settings.trustBarItems ? JSON.parse(settings.trustBarItems) : null,
      metaCapiTokenMasked: settings.metaCapiToken ? 'Configured ✓' : 'Not Configured',
      isCapiConfigured: Boolean(settings.metaCapiToken),
      // Do not expose raw CAPI token
      metaCapiToken: undefined,
    };

    return NextResponse.json({ settings: maskedSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const body = await request.json();
    const {
      storeName,
      tagline,
      logoUrl,
      primaryColor,
      announcementText,
      isAnnouncementActive,
      contactPhone,
      contactEmail,
      contactAddress,
      whatsappNumber,
      facebookUrl,
      instagramUrl,
      youtubeUrl,
      tiktokUrl,
      deliveryDhaka,
      deliveryDhakaSuburbs,
      deliveryOutsideDhaka,
      freeDeliveryThreshold,
      bkashNumber,
      nagadNumber,
      metaPixelId,
      metaCapiToken,
      ga4MeasurementId,
      gtmContainerId,
      trustBarItems,
    } = body;

    // 1. Strict Tracking ID Format Validations
    if (metaPixelId !== undefined) {
      const v = validateTrackingId('pixel', metaPixelId);
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });
    }

    if (ga4MeasurementId !== undefined) {
      const v = validateTrackingId('ga4', ga4MeasurementId);
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });
    }

    if (gtmContainerId !== undefined) {
      const v = validateTrackingId('gtm', gtmContainerId);
      if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });
    }

    const updateData: any = {};
    if (storeName !== undefined) updateData.storeName = storeName.trim();
    if (tagline !== undefined) updateData.tagline = tagline?.trim() || null;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor?.trim() || '#e11d2e';
    if (announcementText !== undefined) updateData.announcementText = announcementText?.trim() || null;
    if (isAnnouncementActive !== undefined) updateData.isAnnouncementActive = Boolean(isAnnouncementActive);

    if (contactPhone !== undefined) updateData.contactPhone = contactPhone?.trim() || null;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail?.trim() || null;
    if (contactAddress !== undefined) updateData.contactAddress = contactAddress?.trim() || null;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber?.trim() || null;
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl?.trim() || null;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl?.trim() || null;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl?.trim() || null;
    if (tiktokUrl !== undefined) updateData.tiktokUrl = tiktokUrl?.trim() || null;

    // Delivery Charges Single Source of Truth
    if (deliveryDhaka !== undefined) updateData.deliveryDhaka = parseFloat(deliveryDhaka) || 0;
    if (deliveryDhakaSuburbs !== undefined) updateData.deliveryDhakaSuburbs = parseFloat(deliveryDhakaSuburbs) || 0;
    if (deliveryOutsideDhaka !== undefined) updateData.deliveryOutsideDhaka = parseFloat(deliveryOutsideDhaka) || 0;
    if (freeDeliveryThreshold !== undefined) updateData.freeDeliveryThreshold = parseFloat(freeDeliveryThreshold) || 0;

    if (bkashNumber !== undefined) updateData.bkashNumber = bkashNumber?.trim() || null;
    if (nagadNumber !== undefined) updateData.nagadNumber = nagadNumber?.trim() || null;

    if (metaPixelId !== undefined) updateData.metaPixelId = metaPixelId?.trim() || null;
    if (metaCapiToken !== undefined && metaCapiToken !== 'Configured ✓') {
      updateData.metaCapiToken = metaCapiToken?.trim() || null;
    }
    if (ga4MeasurementId !== undefined) updateData.ga4MeasurementId = ga4MeasurementId?.trim() || null;
    if (gtmContainerId !== undefined) updateData.gtmContainerId = gtmContainerId?.trim() || null;

    if (trustBarItems !== undefined) {
      updateData.trustBarItems = typeof trustBarItems === 'string' ? trustBarItems : JSON.stringify(trustBarItems);
    }

    const updated = await prisma.storeSetting.upsert({
      where: { id: 'default' },
      update: updateData,
      create: { id: 'default', ...updateData },
    });

    return NextResponse.json({
      success: true,
      message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে।',
      settings: {
        ...updated,
        metaCapiTokenMasked: updated.metaCapiToken ? 'Configured ✓' : 'Not Configured',
        metaCapiToken: undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
