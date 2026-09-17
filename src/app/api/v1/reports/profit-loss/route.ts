import { NextResponse } from 'next/server';
import { getProfitAndLossReport } from '@/services/cashflow.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const report = await getProfitAndLossReport(startDate, endDate);
    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal kalkulasi laporan laba rugi' },
      { status: 500 }
    );
  }
}
