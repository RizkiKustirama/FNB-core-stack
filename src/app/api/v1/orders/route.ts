import { NextResponse } from 'next/server';
import { getOrders } from '@/services/order.service';
import { PaymentMethod, OrderStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const paymentMethod = (searchParams.get('paymentMethod') as PaymentMethod | 'ALL') || undefined;
    const status = (searchParams.get('status') as OrderStatus | 'ALL') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await getOrders({
      startDate,
      endDate,
      paymentMethod,
      status,
      search,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil rekap pesanan.' },
      { status: 500 }
    );
  }
}
