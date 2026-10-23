import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, requireAdmin } from '@/lib/auth';
import { decrementStockForOrder } from '@/lib/stock-manager';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'লগইন করুন।' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));

    const where: any = {};

    // If not admin, can only view own orders!
    if (session.role !== 'ADMIN') {
      where.userId = session.userId;
    } else {
      if (status && status !== 'ALL') {
        where.orderStatus = status;
      }
      if (search) {
        const q = search.trim();
        where.OR = [
          { orderNumber: { contains: q } },
          { customerPhone: { contains: q } },
          { customerName: { contains: q } },
        ];
      }
    }

    const totalCount = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      deliveryZone,
      orderNotes,
      paymentMethod,
      senderNumber,
      trxId,
      couponCode,
      items, // Array of { productId, quantity, variant }
    } = body;

    // 1. Validate Basic Customer Info
    if (!customerName || !customerPhone || !shippingAddress || !deliveryZone) {
      return NextResponse.json(
        { error: 'নাম, মোবাইল নম্বর, পূর্ণাঙ্গ ঠিকানা এবং ডেলিভারি এলাকা নির্বাচন করুন।' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'কার্টে কোনো পণ্য নেই (Cart is empty).' }, { status: 400 });
    }

    // 2. Fetch Single Source of Truth Settings for Delivery Charges
    const settings = await prisma.storeSetting.findUnique({ where: { id: 'default' } });
    const deliveryDhaka = settings?.deliveryDhaka ?? 70;
    const deliveryDhakaSuburbs = settings?.deliveryDhakaSuburbs ?? 100;
    const deliveryOutsideDhaka = settings?.deliveryOutsideDhaka ?? 130;
    const freeDeliveryThreshold = settings?.freeDeliveryThreshold ?? 999;

    // 3. Fetch real products from DB and verify stock & calculate subtotal
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      productName: string;
      productSku: string | null;
      productImage: string | null;
      variant: string | null;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }> = [];

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        return NextResponse.json({ error: `পণ্য পাওয়া যায়নি (Product not found).` }, { status: 400 });
      }

      if (prod.stock < item.quantity) {
        return NextResponse.json(
          { error: `দুঃখিত, "${prod.name}" পর্যাপ্ত স্টকে নেই। বর্তমান স্টক: ${prod.stock} টি।` },
          { status: 400 }
        );
      }

      const unitPrice = prod.price;
      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      let primaryImage: string | null = null;
      try {
        const parsedImages = JSON.parse(prod.images || '[]');
        primaryImage = Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0] : null;
      } catch {}

      // Snapshot Rule #5: Real name, SKU, price, variant, image
      orderItemsData.push({
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        productImage: primaryImage,
        variant: item.variant || null,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
    }

    // 4. Calculate Delivery Charge from Settings
    let deliveryCharge = deliveryDhaka;
    if (deliveryZone === 'DHAKA_SUBURB') {
      deliveryCharge = deliveryDhakaSuburbs;
    } else if (deliveryZone === 'OUTSIDE_DHAKA') {
      deliveryCharge = deliveryOutsideDhaka;
    }

    if (calculatedSubtotal >= freeDeliveryThreshold) {
      deliveryCharge = 0; // Free shipping threshold met!
    }

    // 5. Coupon Discount Calculation
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
        const minOrderOk = !coupon.minOrderAmount || calculatedSubtotal >= coupon.minOrderAmount;
        const usageLimitOk = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;

        if (!isExpired && minOrderOk && usageLimitOk) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (calculatedSubtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountCap && discountAmount > coupon.maxDiscountCap) {
              discountAmount = coupon.maxDiscountCap;
            }
          } else {
            discountAmount = Math.min(coupon.discountValue, calculatedSubtotal);
          }

          // Increment coupon usage
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }
    }

    const totalAmount = Math.max(0, calculatedSubtotal + deliveryCharge - discountAmount);

    // 6. Generate Unique Order Number
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SOK-${dateStr}-${randomSuffix}`;

    // 7. Check logged-in user
    const session = await getSessionUser();
    const userId = session?.userId || null;

    // 8. Create Order & Line Items in Database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail?.trim() || null,
        shippingAddress: shippingAddress.trim(),
        deliveryZone,
        orderNotes: orderNotes?.trim() || null,
        subtotal: calculatedSubtotal,
        deliveryCharge,
        discountAmount,
        totalAmount,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        senderNumber: senderNumber?.trim() || null,
        trxId: trxId?.trim() || null,
        orderStatus: 'PENDING',
        isStockRestored: false,
        couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 9. Atomically decrement stock
    await decrementStockForOrder(items);

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      totalAmount: order.totalAmount,
      message: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'অর্ডার করতে সমস্যা হয়েছে' }, { status: 500 });
  }
}
