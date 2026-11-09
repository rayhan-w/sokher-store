import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Please provide a coupon code.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code.' }, { status: 400 });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }

    const currentSubtotal = parseFloat(subtotal) || 0;
    if (coupon.minOrderAmount && currentSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount of ৳${coupon.minOrderAmount} required for this coupon.` },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'This coupon has reached its maximum usage limit.' }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (currentSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountCap && discount > coupon.maxDiscountCap) {
        discount = coupon.maxDiscountCap;
      }
    } else {
      discount = Math.min(coupon.discountValue, currentSubtotal);
    }

    return NextResponse.json({
      valid: true,
      couponCode: coupon.code,
      discountAmount: Math.round(discount),
      message: `Coupon code applied! You saved ৳${Math.round(discount)}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
