import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const now = new Date();

    // Fetch active flash sale that hasn't expired yet
    const flashSale = await prisma.flashSale.findFirst({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gt: now },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                categories: { include: { category: true } },
              },
            },
          },
        },
      },
    });

    if (!flashSale) {
      return NextResponse.json({ flashSale: null, active: false });
    }

    return NextResponse.json({
      active: true,
      flashSale: {
        ...flashSale,
        items: flashSale.items.map((item) => ({
          ...item,
          product: {
            ...item.product,
            images: JSON.parse(item.product.images || '[]'),
          },
        })),
      },
    });
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

    const { title, startTime, endTime, items = [] } = await request.json();

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'ফ্ল্যাশ সেলের শিরোনাম, শুরুর সময় ও শেষের সময় দিন।' }, { status: 400 });
    }

    const flashSale = await prisma.flashSale.create({
      data: {
        title: title.trim(),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive: true,
        items: {
          create: items.map((i: any) => ({
            productId: i.productId,
            salePrice: parseFloat(i.salePrice),
            stockLimit: i.stockLimit ? parseInt(i.stockLimit) : null,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, flashSale, message: 'ফ্ল্যাশ সেল তৈরি হয়েছে।' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
