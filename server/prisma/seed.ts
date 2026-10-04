import { PrismaClient, SupplierType, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed SKU Mappings
  const mapping1 = await prisma.skuMapping.upsert({
    where: { storeSku: 'RET-WATCH-001-SLV' },
    update: {},
    create: {
      storeSku: 'RET-WATCH-001-SLV',
      productName: 'Minimalist Stainless Steel Watch - Silver',
      primarySupplier: SupplierType.CJ,
      primarySupplierSku: 'CJ-WATCH-SLV-9921',
      primarySupplierPid: 'CJ-P-100234',
      primarySupplierVid: 'CJ-V-9921',
      primaryCostPrice: 12.5,
      primaryShippingCost: 4.2,
      backupSupplier: SupplierType.ZENDROP,
      backupSupplierSku: 'ZD-WATCH-SLV-01',
      backupSupplierPid: 'ZD-P-8821',
      backupSupplierVid: 'ZD-V-01',
      backupCostPrice: 13.8,
      backupShippingCost: 4.5,
      markupMultiplier: 2.5,
      shippingBufferUsd: 3.0,
      calculatedSellingPrice: 44.75, // (12.5 + 4.2) * 2.5 + 3.0
      isActive: true,
    },
  });

  const mapping2 = await prisma.skuMapping.upsert({
    where: { storeSku: 'RET-BAG-002-BLK' },
    update: {},
    create: {
      storeSku: 'RET-BAG-002-BLK',
      productName: 'Waterproof Travel Crossbody Bag - Black',
      primarySupplier: SupplierType.CJ,
      primarySupplierSku: 'CJ-BAG-BLK-4412',
      primarySupplierPid: 'CJ-P-55412',
      primarySupplierVid: 'CJ-V-4412',
      primaryCostPrice: 8.0,
      primaryShippingCost: 3.5,
      backupSupplier: SupplierType.ZENDROP,
      backupSupplierSku: 'ZD-BAG-BLK-02',
      backupCostPrice: 9.0,
      backupShippingCost: 3.8,
      markupMultiplier: 2.5,
      shippingBufferUsd: 3.0,
      calculatedSellingPrice: 31.75,
      isActive: true,
    },
  });

  // 2. Seed Test Orders
  const sampleOrder = await prisma.order.upsert({
    where: { shopifyOrderId: 'gid://shopify/Order/9900112233' },
    update: {},
    create: {
      shopifyOrderId: 'gid://shopify/Order/9900112233',
      shopifyOrderNumber: '#1001',
      shopifyCreatedAt: new Date(),
      customerEmail: 'customer@example.com',
      customerPhone: '+1 555-0199',
      shippingName: 'John Doe',
      shippingAddress1: '742 Evergreen Terrace',
      shippingAddress2: 'Apt 4B',
      shippingCity: 'Springfield',
      shippingProvince: 'Oregon',
      shippingProvinceCode: 'OR',
      shippingZip: '97477',
      shippingCountry: 'United States',
      shippingCountryCode: 'US',
      currency: 'USD',
      totalPrice: 76.5,
      subtotalPrice: 76.5,
      totalShipping: 0.0,
      totalTax: 0.0,
      financialStatus: 'paid',
      status: OrderStatus.PENDING_HOLD,
      holdExpiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      items: {
        create: [
          {
            shopifyLineItemId: 'gid://shopify/LineItem/101',
            shopifyProductId: 'gid://shopify/Product/501',
            shopifyVariantId: 'gid://shopify/ProductVariant/601',
            title: 'Minimalist Stainless Steel Watch - Silver',
            storeSku: 'RET-WATCH-001-SLV',
            quantity: 1,
            price: 44.75,
            skuMappingId: mapping1.id,
          },
          {
            shopifyLineItemId: 'gid://shopify/LineItem/102',
            shopifyProductId: 'gid://shopify/Product/502',
            shopifyVariantId: 'gid://shopify/ProductVariant/602',
            title: 'Waterproof Travel Crossbody Bag - Black',
            storeSku: 'RET-BAG-002-BLK',
            quantity: 1,
            price: 31.75,
            skuMappingId: mapping2.id,
          },
        ],
      },
    },
  });

  console.log('✅ Seeding complete!');
  console.log(`- Created/Verified SKU Mappings: ${mapping1.storeSku}, ${mapping2.storeSku}`);
  console.log(`- Created/Verified Sample Order: ${sampleOrder.shopifyOrderNumber}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
