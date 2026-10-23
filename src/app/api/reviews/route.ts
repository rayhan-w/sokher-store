import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const where: any = { status: 'APPROVED' };
    if (productId) where.productId = productId;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { productId, rating, comment, customerName } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'রেটিং এবং মন্তব্য দিন।' }, { status: 400 });
    }

    const session = await getSessionUser();
    let isVerified = false;

    // Check if user has purchased this product before to mark verified
    if (session?.userId) {
      const purchased = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId: session.userId,
            orderStatus: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
          },
        },
      });
      if (purchased) isVerified = true;
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session?.userId || null,
        customerName: customerName?.trim() || session?.name || 'Anonymous Customer',
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment: comment.trim(),
        isVerified,
        status: 'APPROVED',
      },
    });

    return NextResponse.json({ success: true, review, message: 'আপনার রিভিউ জমা দেওয়া হয়েছে।' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
