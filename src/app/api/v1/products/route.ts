import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/services/product.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const activeOnlyStr = searchParams.get('activeOnly');
    const activeOnly = activeOnlyStr === 'true';

    const products = await getProducts(categoryId, activeOnly);
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengambil katalog produk' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, categoryId, imageUrl, isActive, recipes } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { success: false, message: 'Nama menu, harga, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name,
      price: Number(price),
      categoryId,
      imageUrl: imageUrl || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      recipes: Array.isArray(recipes) ? recipes : [],
    });

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Berhasil membuat menu baru',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal membuat menu baru' },
      { status: 500 }
    );
  }
}
