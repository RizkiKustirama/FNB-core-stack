import { prisma } from '@/lib/prisma';

export async function getProducts(categoryId?: string, activeOnly: boolean = false) {
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
    orderBy: { createdAt: 'desc' },
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

export async function createCategory(name: string) {
  return await prisma.category.create({
    data: { name },
  });
}

export interface RecipeInput {
  rawMaterialId: string;
  quantityNeeded: number;
}

export interface CreateProductInput {
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string | null;
  isActive?: boolean;
  recipes?: RecipeInput[];
}

export async function createProduct(input: CreateProductInput) {
  const { name, price, categoryId, imageUrl, isActive = true, recipes = [] } = input;

  return await prisma.product.create({
    data: {
      name,
      price,
      categoryId,
      imageUrl: imageUrl || null,
      isActive,
      recipes: {
        create: recipes.map((r) => ({
          rawMaterialId: r.rawMaterialId,
          quantityNeeded: r.quantityNeeded,
        })),
      },
    },
    include: {
      category: true,
      recipes: {
        include: {
          rawMaterial: true,
        },
      },
    },
  });
}

export async function updateProduct(id: string, input: CreateProductInput) {
  const { name, price, categoryId, imageUrl, isActive, recipes = [] } = input;

  // Use transaction to update product details and replace recipe items atomically
  return await prisma.$transaction(async (tx) => {
    // Delete existing recipe items for this product
    await tx.recipeItem.deleteMany({
      where: { productId: id },
    });

    // Update product and re-create recipe items
    const updated = await tx.product.update({
      where: { id },
      data: {
        name,
        price,
        categoryId,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        isActive: isActive !== undefined ? isActive : true,
        recipes: {
          create: recipes.map((r) => ({
            rawMaterialId: r.rawMaterialId,
            quantityNeeded: r.quantityNeeded,
          })),
        },
      },
      include: {
        category: true,
        recipes: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });

    return updated;
  });
}

export async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id },
  });
}
