import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'অননুমোদিত এক্সেস' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'orders';

    if (type === 'orders') {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });

      const rows = [
        ['Order Number', 'Date', 'Customer Name', 'Phone', 'Zone', 'Subtotal', 'Delivery', 'Discount', 'Total', 'Payment Method', 'Status'],
        ...orders.map((o) => [
          o.orderNumber,
          o.createdAt.toISOString().slice(0, 10),
          `"${o.customerName.replace(/"/g, '""')}"`,
          o.customerPhone,
          o.deliveryZone,
          o.subtotal,
          o.deliveryCharge,
          o.discountAmount,
          o.totalAmount,
          o.paymentMethod,
          o.orderStatus,
        ]),
      ];

      const csvContent = rows.map((e) => e.join(',')).join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=orders-export-${Date.now()}.csv`,
        },
      });
    }

    if (type === 'products') {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const rows = [
        ['Name', 'SKU', 'Price', 'Regular Price', 'Stock', 'Status', 'Badge', 'View Count'],
        ...products.map((p) => [
          `"${p.name.replace(/"/g, '""')}"`,
          p.sku,
          p.price,
          p.regularPrice || '',
          p.stock,
          p.status,
          p.badge || '',
          p.viewCount,
        ]),
      ];

      const csvContent = rows.map((e) => e.join(',')).join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=products-export-${Date.now()}.csv`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
