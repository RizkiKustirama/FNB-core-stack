import { prisma } from '@/lib/prisma';
import { PaymentMethod, OrderStatus } from '@prisma/client';

export interface GetOrdersFilter {
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod | 'ALL';
  status?: OrderStatus | 'ALL';
  search?: string;
}

export async function getOrders(filter: GetOrdersFilter = {}) {
  const { startDate, endDate, paymentMethod, status, search } = filter;

  // Build Prisma where clause
  const where: any = {};

  // Date range filter
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.createdAt.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  // Payment method filter
  if (paymentMethod && paymentMethod !== 'ALL') {
    where.paymentMethod = paymentMethod;
  }

  // Order status filter
  if (status && status !== 'ALL') {
    where.status = status;
  }

  // Search filter (Order Number or Cashier Name)
  if (search && search.trim() !== '') {
    const term = search.trim();
    where.OR = [
      { orderNumber: { contains: term, mode: 'insensitive' } },
      { cashier: { name: { contains: term, mode: 'insensitive' } } },
    ];
  }

  // Fetch orders with item details & cashier info
  const orders = await prisma.order.findMany({
    where,
    include: {
      cashier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Convert Decimal values to Number for clean JSON responses
  const formattedOrders = orders.map((order) => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    cashReceived: order.cashReceived ? Number(order.cashReceived) : null,
    changeAmount: order.changeAmount ? Number(order.changeAmount) : null,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
  }));

  // Calculate summary metrics
  const totalOrders = formattedOrders.length;
  const totalSales = formattedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const cashCount = formattedOrders.filter((o) => o.paymentMethod === 'CASH').length;
  const qrisCount = formattedOrders.filter((o) => o.paymentMethod === 'QRIS').length;
  const transferCount = formattedOrders.filter((o) => o.paymentMethod === 'TRANSFER').length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  return {
    summary: {
      totalOrders,
      totalSales,
      cashCount,
      qrisCount,
      transferCount,
      averageOrderValue,
    },
    orders: formattedOrders,
  };
}

export async function getOrderDetail(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      cashier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    cashReceived: order.cashReceived ? Number(order.cashReceived) : null,
    changeAmount: order.changeAmount ? Number(order.changeAmount) : null,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
  };
}
