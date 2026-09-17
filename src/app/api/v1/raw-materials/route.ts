import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRawMaterials } from '@/services/inventory.service';

export async function GET() {
  try {
    const materials = await getRawMaterials();
    return NextResponse.json({ success: true, data: materials });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil data bahan baku' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const material = await prisma.rawMaterial.create({
      data: {
        name: body.name,
        unit: body.unit || 'GRAM',
        currentStock: parseFloat(body.currentStock) || 0,
        minStock: parseFloat(body.minStock) || 0,
        category: body.category || 'Lainnya',
      },
    });

    return NextResponse.json({ success: true, data: material });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menambahkan bahan baku' },
      { status: 400 }
    );
  }
}
