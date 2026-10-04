import { orderService } from '../services/order.service.js';
import { prisma } from '../database/client.js';
import { SupplierType } from '@prisma/client';

async function run() {
  const args = process.argv.slice(2);
  const orderIdentifier = args[0];
  const forceSupplier = args[1] as SupplierType | undefined;

  if (!orderIdentifier) {
    console.log('Usage: npx tsx scripts/manualOrderPush.ts <orderId_or_shopifyOrderNumber> [CJ|ZENDROP]');
    process.exit(1);
  }

  console.log(`🔍 Looking up order: ${orderIdentifier}...`);

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdentifier },
        { shopifyOrderNumber: orderIdentifier },
        { shopifyOrderId: orderIdentifier },
      ],
    },
    include: { items: true },
  });

  if (!order) {
    console.error(`❌ Error: Order "${orderIdentifier}" not found in database.`);
    process.exit(1);
  }

  console.log(`📦 Found Order: ID=${order.id}, Shopify#=${order.shopifyOrderNumber}, Status=${order.status}`);
  console.log(`🚀 Triggering manual order push to supplier (${forceSupplier || 'Default Mapping'})...`);

  try {
    const result = await orderService.dispatchOrderToSupplier(order.id, forceSupplier);
    console.log(`✅ Result: Order status is now ${result.status}`);
    if (result.supplierOrderId) {
      console.log(`🎉 Supplier Order ID: ${result.supplierOrderId} (${result.supplierType})`);
    }
  } catch (error: any) {
    console.error(`❌ Push failed: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

run();
