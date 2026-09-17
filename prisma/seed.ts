import { PrismaClient, Role, Unit } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('kasir123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fnb.com' },
    update: {},
    create: {
      name: 'Admin Owner',
      email: 'admin@fnb.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'kasir@fnb.com' },
    update: {},
    create: {
      name: 'Budi Kasir',
      email: 'kasir@fnb.com',
      passwordHash: cashierPassword,
      role: Role.CASHIER,
    },
  });

  console.log(`Created users: ${admin.email} (ADMIN), ${cashier.email} (CASHIER)`);

  // 2. Create Categories
  const catMakanan = await prisma.category.upsert({
    where: { name: 'Makanan' },
    update: {},
    create: { name: 'Makanan' },
  });

  const catMinuman = await prisma.category.upsert({
    where: { name: 'Minuman' },
    update: {},
    create: { name: 'Minuman' },
  });

  // 3. Create Raw Materials (Bahan Baku)
  const miMentah = await prisma.rawMaterial.create({
    data: {
      name: 'Mi Mentah',
      unit: Unit.PCS,
      currentStock: 100,
      minStock: 20,
      category: 'Bahan Utama',
    },
  });

  const ayamTabur = await prisma.rawMaterial.create({
    data: {
      name: 'Ayam Tabur',
      unit: Unit.GRAM,
      currentStock: 2000,
      minStock: 500,
      category: 'Bahan Utama',
    },
  });

  const pangsit = await prisma.rawMaterial.create({
    data: {
      name: 'Pangsit Goreng',
      unit: Unit.PCS,
      currentStock: 200,
      minStock: 40,
      category: 'Pelengkap',
    },
  });

  const paperBowl = await prisma.rawMaterial.create({
    data: {
      name: 'Paper Bowl 650ml',
      unit: Unit.PCS,
      currentStock: 150,
      minStock: 30,
      category: 'Kemasan',
    },
  });

  const kopiEspresso = await prisma.rawMaterial.create({
    data: {
      name: 'Espresso Blend Coffee',
      unit: Unit.GRAM,
      currentStock: 1000,
      minStock: 200,
      category: 'Bumbu & Bahan',
    },
  });

  const susuUht = await prisma.rawMaterial.create({
    data: {
      name: 'Susu UHT Fresh',
      unit: Unit.ML,
      currentStock: 5000,
      minStock: 1000,
      category: 'Bumbu & Bahan',
    },
  });

  console.log('Created Raw Materials');

  // 4. Create Products
  const cwieMie = await prisma.product.create({
    data: {
      name: 'Cwie Mie Original',
      price: 18000,
      categoryId: catMakanan.id,
      isActive: true,
    },
  });

  const esKopiSusu = await prisma.product.create({
    data: {
      name: 'Es Kopi Susu Aren',
      price: 15000,
      categoryId: catMinuman.id,
      isActive: true,
    },
  });

  console.log('Created Products');

  // 5. Create Bill of Materials (Recipes)
  // Cwie Mie Original: 1 pcs Mi Mentah + 50g Ayam Tabur + 2 pcs Pangsit + 1 pcs Paper Bowl
  await prisma.recipeItem.createMany({
    data: [
      { productId: cwieMie.id, rawMaterialId: miMentah.id, quantityNeeded: 1 },
      { productId: cwieMie.id, rawMaterialId: ayamTabur.id, quantityNeeded: 50 },
      { productId: cwieMie.id, rawMaterialId: pangsit.id, quantityNeeded: 2 },
      { productId: cwieMie.id, rawMaterialId: paperBowl.id, quantityNeeded: 1 },
    ],
  });

  // Es Kopi Susu Aren: 18g Kopi Espresso + 120ml Susu UHT
  await prisma.recipeItem.createMany({
    data: [
      { productId: esKopiSusu.id, rawMaterialId: kopiEspresso.id, quantityNeeded: 18 },
      { productId: esKopiSusu.id, rawMaterialId: susuUht.id, quantityNeeded: 120 },
    ],
  });

  console.log('Created BoM Recipes');
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
