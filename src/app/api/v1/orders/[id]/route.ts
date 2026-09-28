import { NextResponse } from 'next/server';
import { getOrderDetail } from '@/services/order.service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await getOrderDetail(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil detail pesanan.' },
      { status: 500 }
    );
  }
}
