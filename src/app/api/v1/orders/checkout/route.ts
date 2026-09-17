import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { processCheckout } from '@/services/pos.service';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const order = await processCheckout({
      cashierId: session?.user?.id,
      paymentMethod: body.paymentMethod,
      cashReceived: body.cashReceived,
      items: body.items,
    });

    return NextResponse.json({
      success: true,
      message: 'Transaksi kasir berhasil diproses.',
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses transaksi' },
      { status: 400 }
    );
  }
}
