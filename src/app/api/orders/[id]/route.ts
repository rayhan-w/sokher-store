import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, requireAdmin } from '@/lib/auth';
import { restoreStockForCancelledOrder } from '@/lib/stock-manager';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getSessionUser();

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'অর্ডারটি পাওয়া যায়নি (Order not found).' }, { status: 404 });
    }

    // Security check: non-admin can only access own order or if querying by orderNumber
    if (session?.role !== 'ADMIN' && order.userId && session?.userId !== order.userId) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত অ্যাডমিন এক্সেস' }, { status: 401 });
    }

    const { id } = params;
    const { orderStatus, paymentStatus } = await request.json();

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'অর্ডার পাওয়া যায়নি।' }, { status: 404 });
    }

    // Critical Rule #7: If status is CANCELLED, invoke idempotent stock restoration!
    if (orderStatus === 'CANCELLED') {
      const cancelResult = await restoreStockForCancelledOrder(existing.id);

      // If payment status was also sent, update it
      if (paymentStatus) {
        await prisma.order.update({
          where: { id: existing.id },
          data: { paymentStatus },
        });
      }

      return NextResponse.json({
        success: true,
        message: cancelResult.message,
      });
    }

    // Normal status transition (PENDING, CONFIRMED, PACKED, SHIPPED, DELIVERED)
    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'অর্ডার আপডেট ব্যর্থ' }, { status: 500 });
  }
}
