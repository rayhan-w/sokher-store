import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ coupons });
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

    const { code, discountType, discountValue, minOrderAmount, maxDiscountCap, expiryDate, usageLimit } =
      await request.json();

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'কুপন কোড এবং ডিসকাউন্ট পরিমাণ আবশ্যক।' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: 'এই কুপন কোডটি আগেই তৈরি করা হয়েছে।' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscountCap: maxDiscountCap ? parseFloat(maxDiscountCap) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      },
    });

    return NextResponse.json({ success: true, coupon, message: 'কুপন তৈরি হয়েছে।' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
