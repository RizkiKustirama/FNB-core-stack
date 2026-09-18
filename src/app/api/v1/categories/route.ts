import { NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/services/product.service';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil kategori' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Nama kategori wajib diisi' },
        { status: 400 }
      );
    }

    const category = await createCategory(name.trim());
    return NextResponse.json({
      success: true,
      data: category,
      message: 'Berhasil membuat kategori baru',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal membuat kategori' },
      { status: 500 }
    );
  }
}
