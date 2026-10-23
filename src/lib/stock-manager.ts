import prisma from './prisma';

/**
 * Idempotent Stock Manager for Sokher Store
 * Enforces Rule #7:
 * "Cancelled order-e stock ferot asbe thik ekbar — doibar cancel chapleo stock dubar barbe na (idempotent)."
 */
export async function restoreStockForCancelledOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error(`Order #${orderId} পাওয়া যায়নি (Order not found).`);
    }

    // Critical Idempotency check:
    if (order.isStockRestored) {
      // Stock has already been restored once. Do not increment again!
      if (order.orderStatus !== 'CANCELLED') {
        await tx.order.update({
          where: { id: orderId },
          data: { orderStatus: 'CANCELLED' },
        });
      }
      return {
        success: true,
        message: 'স্টক পূর্বেই পুনরুদ্ধার করা হয়েছে (Stock was already restored previously).',
      };
    }

    // Restore stock for all products in this order
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Mark order as cancelled and flag isStockRestored to TRUE
    await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: 'CANCELLED',
        isStockRestored: true,
      },
    });

    return {
      success: true,
      message: 'অর্ডার বাতিল হয়েছে এবং স্টক সফলভাবে ফেরত আনা হয়েছে (Order cancelled and stock restored once).',
    };
  });
}

/**
 * Atomically decrements stock when a new order is placed
 */
export async function decrementStockForOrder(items: Array<{ productId: string; quantity: number }>) {
  for (const item of items) {
    if (item.productId) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }
  }
}
