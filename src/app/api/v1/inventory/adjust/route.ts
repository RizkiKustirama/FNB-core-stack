import { NextResponse } from 'next/server';
import { adjustStock } from '@/services/inventory.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await adjustStock({
      rawMaterialId: body.rawMaterialId,
      qty: parseFloat(body.qty),
      type: body.type, // 'IN' | 'OUT'
      referenceType: body.referenceType || 'OPNAME_ADJUSTMENT',
      reason: body.reason,
    });

    return NextResponse.json({
      success: true,
      message: 'Penyesuaian stok inventori berhasil disimpan.',
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyesuaikan stok' },
      { status: 400 }
    );
  }
}
