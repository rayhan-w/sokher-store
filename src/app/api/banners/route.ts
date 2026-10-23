import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: any = { isActive: true };
    if (type) where.type = type;

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, subtitle, badge, buttonText, buttonUrl, imageUrl, order = 0 } = body;

    if (!type || !imageUrl) {
      return NextResponse.json({ error: 'ব্যানারের ধরন এবং ছবি আবশ্যক।' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        type,
        title: title?.trim() || null,
        subtitle: subtitle?.trim() || null,
        badge: badge?.trim() || null,
        buttonText: buttonText?.trim() || null,
        buttonUrl: buttonUrl?.trim() || null,
        imageUrl: imageUrl.trim(),
        order: parseInt(order) || 0,
      },
    });

    return NextResponse.json({ success: true, banner, message: 'ব্যানার যোগ করা হয়েছে।' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
