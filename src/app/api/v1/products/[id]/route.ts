import { NextResponse } from 'next/server';
import { updateProduct, deleteProduct } from '@/services/product.service';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, price, categoryId, imageUrl, isActive, recipes } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { success: false, message: 'Nama menu, harga, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    const updated = await updateProduct(id, {
      name,
      price: Number(price),
      categoryId,
      imageUrl,
      isActive: Boolean(isActive),
      recipes: Array.isArray(recipes) ? recipes : [],
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Berhasil mengupdate menu',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengupdate menu' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteProduct(id);

    return NextResponse.json({
      success: true,
      message: 'Berhasil menghapus menu',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus menu' },
      { status: 500 }
    );
  }
}
