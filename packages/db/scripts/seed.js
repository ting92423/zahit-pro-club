/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();

  // 商品
  const existingAmericano = await prisma.product.findFirst({ where: { name: '美式咖啡' } });
  const americano =
    existingAmericano ??
    (await prisma.product.create({
      data: { name: '美式咖啡', description: '經典黑咖啡', isActive: true },
    }));

  const existingLatte = await prisma.product.findFirst({ where: { name: '拿鐵咖啡' } });
  const latte =
    existingLatte ??
    (await prisma.product.create({
      data: { name: '拿鐵咖啡', description: '咖啡與牛奶的平衡', isActive: true },
    }));

  // SKU（用穩定 skuCode，方便前端直接下單）
  const skuAmericano = await prisma.sku.upsert({
    where: { skuCode: 'sku_americano' },
    update: { price: 120, stock: 999, productId: americano.id },
    create: {
      skuCode: 'sku_americano',
      productId: americano.id,
      price: 120,
      memberPrice: 110,
      stock: 999,
    },
  });

  const skuLatte = await prisma.sku.upsert({
    where: { skuCode: 'sku_latte' },
    update: { price: 160, stock: 999, productId: latte.id },
    create: {
      skuCode: 'sku_latte',
      productId: latte.id,
      price: 160,
      memberPrice: 150,
      stock: 999,
    },
  });

  console.log('Seed complete');
  console.log({ skuAmericano: skuAmericano.skuCode, skuLatte: skuLatte.skuCode });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

