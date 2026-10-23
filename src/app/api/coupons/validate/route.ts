import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'কুপন কোড প্রদান করুন।' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'ভুল বা নিষ্ক্রিয় কুপন কোড (Invalid coupon).' }, { status: 400 });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'কুপনটির মেয়াদ শেষ হয়ে গেছে (Coupon expired).' }, { status: 400 });
    }

    const currentSubtotal = parseFloat(subtotal) || 0;
    if (coupon.minOrderAmount && currentSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `এই কুপনটি ব্যবহার করতে ন্যূনতম ৳${coupon.minOrderAmount} টাকার পণ্য অর্ডার করতে হবে।` },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'কুপনটির ব্যবহারের সর্বোচ্চ সীমা শেষ।' }, { status: 400 });
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
      message: `কুপন কোড সফলভাবে যোগ করা হয়েছে! আপনি ৳${Math.round(discount)} ছাড় পেয়েছেন।`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
