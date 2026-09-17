import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCashflowLogs, createExpense } from '@/services/cashflow.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') as 'IN' | 'OUT') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const logs = await getCashflowLogs(type, startDate, endDate);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil log arus kas' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const expense = await createExpense({
      userId: session?.user?.id,
      category: body.category || 'OTHER',
      amount: parseFloat(body.amount),
      description: body.description,
      proofImageUrl: body.proofImageUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Catatan pengeluaran berhasil disimpan.',
      data: expense,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mencatat pengeluaran' },
      { status: 400 }
    );
  }
}
