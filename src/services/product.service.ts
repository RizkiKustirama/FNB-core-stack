import { prisma } from '@/lib/prisma';

export async function getProducts(categoryId?: string, activeOnly: boolean = true) {
  const products = await prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(activeOnly ? { isActive: true } : {}),
    },
    include: {
      category: true,
      recipes: {
        include: {
          rawMaterial: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return products.map((prod) => ({
    ...prod,
    price: Number(prod.price),
    recipes: prod.recipes.map((r) => ({
      ...r,
      quantityNeeded: Number(r.quantityNeeded),
      rawMaterial: {
        ...r.rawMaterial,
        currentStock: Number(r.rawMaterial.currentStock),
        minStock: Number(r.rawMaterial.minStock),
      },
    })),
  }));
}

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}
