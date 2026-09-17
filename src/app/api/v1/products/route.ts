import { NextResponse } from 'next/server';
import { getProducts } from '@/services/product.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;

    const products = await getProducts(categoryId, true);
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil katalog produk' },
      { status: 500 }
    );
  }
}
