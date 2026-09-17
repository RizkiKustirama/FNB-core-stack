import { prisma } from '@/lib/prisma';

export async function getRawMaterials() {
  const materials = await prisma.rawMaterial.findMany({
    orderBy: { name: 'asc' },
  });

  return materials.map((item) => ({
    ...item,
    currentStock: Number(item.currentStock),
    minStock: Number(item.minStock),
    isLowStock: Number(item.currentStock) <= Number(item.minStock),
  }));
}

export async function adjustStock(data: {
  rawMaterialId: string;
  qty: number;
  type: 'IN' | 'OUT';
  referenceType: 'POS_DEDUCTION' | 'OPNAME_ADJUSTMENT' | 'WASTE' | 'EXPIRED' | 'INITIAL';
  reason?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    const rawMaterial = await tx.rawMaterial.findUnique({
      where: { id: data.rawMaterialId },
    });

    if (!rawMaterial) {
      throw new Error('Bahan baku tidak ditemukan.');
    }

    const currentStockNum = Number(rawMaterial.currentStock);
    const newStock =
      data.type === 'IN'
        ? currentStockNum + data.qty
        : currentStockNum - data.qty;

    if (newStock < 0) {
      throw new Error(`Stok ${rawMaterial.name} tidak mencukupi (Sisa: ${currentStockNum} ${rawMaterial.unit}).`);
    }

    const updated = await tx.rawMaterial.update({
      where: { id: data.rawMaterialId },
      data: { currentStock: newStock },
    });

    const log = await tx.inventoryLog.create({
      data: {
        rawMaterialId: data.rawMaterialId,
        type: data.type,
        qty: data.qty,
        referenceType: data.referenceType,
        reason: data.reason || null,
      },
    });

    return { updated, log };
  });
}
