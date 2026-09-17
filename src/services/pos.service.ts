import { prisma } from '@/lib/prisma';

export interface CheckoutInput {
  cashierId?: string;
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
  cashReceived?: number;
  items: {
    productId: string;
    qty: number;
    price: number;
    note?: string;
  }[];
}

export async function processCheckout(input: CheckoutInput) {
  if (!input.items || input.items.length === 0) {
    throw new Error('Keranjang belanja kosong.');
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Calculate Total Amount
    const totalAmount = input.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    // 2. Validate Cash Payment if CASH
    let changeAmount = 0;
    if (input.paymentMethod === 'CASH') {
      const received = input.cashReceived || 0;
      if (received < totalAmount) {
        throw new Error(`Uang tunai yang diterima (Rp ${received.toLocaleString()}) kurang dari total transaksi (Rp ${totalAmount.toLocaleString()}).`);
      }
      changeAmount = received - totalAmount;
    }

    // 3. Generate Order Number: INV-YYYYMMDD-XXXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await tx.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const seq = String(countToday + 1).padStart(4, '0');
    const orderNumber = `INV-${todayStr}-${seq}`;

    // 4. Create Order record
    const order = await tx.order.create({
      data: {
        orderNumber,
        totalAmount,
        cashReceived: input.paymentMethod === 'CASH' ? (input.cashReceived || totalAmount) : totalAmount,
        changeAmount,
        paymentMethod: input.paymentMethod,
        status: 'PAID',
        cashierId: input.cashierId || null,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price,
            subtotal: item.price * item.qty,
            note: item.note || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        cashier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 5. Auto-Deduct Stock Trigger based on BoM Recipe
    for (const item of input.items) {
      // Find recipe items for this product
      const recipes = await tx.recipeItem.findMany({
        where: { productId: item.productId },
        include: { rawMaterial: true },
      });

      for (const recipe of recipes) {
        const quantityNeededNum = Number(recipe.quantityNeeded);
        const totalNeeded = quantityNeededNum * item.qty;

        // Check if raw material exists and stock is available
        const rawMaterial = await tx.rawMaterial.findUnique({
          where: { id: recipe.rawMaterialId },
        });

        if (!rawMaterial) continue;

        const currentStockNum = Number(rawMaterial.currentStock);
        const newStock = currentStockNum - totalNeeded;

        // Deduct raw material stock
        await tx.rawMaterial.update({
          where: { id: recipe.rawMaterialId },
          data: { currentStock: newStock },
        });

        // Record in inventory_logs
        await tx.inventoryLog.create({
          data: {
            rawMaterialId: recipe.rawMaterialId,
            type: 'OUT',
            qty: totalNeeded,
            referenceType: 'POS_DEDUCTION',
            referenceId: order.id,
            reason: `Penjualan POS #${order.orderNumber} (${item.qty}x ${recipe.rawMaterial.name})`,
          },
        });
      }
    }

    // 6. Auto Cash-In Trigger: Create Record in cashflow_logs
    await tx.cashflowLog.create({
      data: {
        type: 'IN',
        category: 'POS_SALES',
        amount: totalAmount,
        referenceId: order.id,
        description: `Penjualan POS Ref #${order.orderNumber}`,
        userId: input.cashierId || null,
      },
    });

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      cashReceived: Number(order.cashReceived),
      changeAmount: Number(order.changeAmount),
    };
  });
}
