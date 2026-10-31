import { prisma } from '../database/client.js';
import { OrderStatus } from '@prisma/client';
import { CONSTANTS } from '../config/constants.js';
import { ShopifyOrderWebhookPayload } from '../types/order.types.js';
import { normalizeAddress } from '../utils/addressNormalizer.js';
import { logger } from '../utils/logger.js';

export async function ingestShopifyOrder(payload: ShopifyOrderWebhookPayload) {
  const shopifyOrderId = String(payload.admin_graphql_api_id || payload.id);
  const existingOrder = await prisma.order.findUnique({
    where: { shopifyOrderId },
    include: { items: true },
  });

  if (existingOrder) {
    logger.info({ shopifyOrderId }, 'Order already exists in database, skipping duplicate ingestion');
    return existingOrder;
  }

  const rawShipping = payload.shipping_address || {
    name: payload.name || 'Valued Customer',
    address1: '123 Main St',
    city: 'Austin',
    province: 'Texas',
    province_code: 'TX',
    zip: '78701',
    country: 'United States',
    country_code: 'US',
  };

  const normalizedAddress = normalizeAddress(rawShipping);
  let holdMinutes = CONSTANTS.HOLD_BUFFER_HOURS * 60;
  try {
    const s = await prisma.appSetting.findUnique({ where: { key: 'orders.holdDurationMinutes' } });
    if (s?.value) holdMinutes = Number(JSON.parse(s.value)) || holdMinutes;
  } catch {}
  const holdExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

  const initialStatus = normalizedAddress.isValid
    ? OrderStatus.PENDING_HOLD
    : OrderStatus.MANUAL_REVIEW;

  const notes = normalizedAddress.isValid
    ? null
    : `Address validation failed: ${normalizedAddress.validationErrors.join('; ')}`;

  const createdOrder = await prisma.order.create({
    data: {
      shopifyOrderId,
      shopifyOrderNumber: String(payload.name || payload.order_number),
      shopifyCreatedAt: new Date(payload.created_at || Date.now()),
      customerEmail: payload.email || 'no-email@customer.com',
      customerPhone: payload.phone || normalizedAddress.phone,

      shippingName: normalizedAddress.name,
      shippingAddress1: normalizedAddress.address1,
      shippingAddress2: normalizedAddress.address2,
      shippingCity: normalizedAddress.city,
      shippingProvince: normalizedAddress.stateName,
      shippingProvinceCode: normalizedAddress.stateCode,
      shippingZip: normalizedAddress.zipCode,
      shippingCountry: normalizedAddress.country,
      shippingCountryCode: normalizedAddress.countryCode,

      currency: payload.currency || 'USD',
      totalPrice: Number(payload.total_price) || 0,
      subtotalPrice: Number(payload.subtotal_price) || 0,
      financialStatus: payload.financial_status || 'paid',

      status: initialStatus,
      holdExpiresAt,
      manualReviewNotes: notes,

      items: {
        create: await Promise.all(
          payload.line_items.map(async (item) => {
            const skuMapping = await prisma.skuMapping.findUnique({
              where: { storeSku: item.sku },
            });
            return {
              shopifyLineItemId: String(item.id),
              shopifyProductId: item.product_id ? String(item.product_id) : null,
              shopifyVariantId: String(item.variant_id),
              title: item.title,
              variantTitle: item.variant_title || null,
              storeSku: item.sku,
              quantity: item.quantity,
              price: Number(item.price) || 0,
              skuMappingId: skuMapping ? skuMapping.id : null,
            };
          })
        ),
      },
    },
    include: { items: true },
  });

  logger.info(
    { orderId: createdOrder.id, shopifyOrderNumber: createdOrder.shopifyOrderNumber, status: createdOrder.status },
    'Ingested new Shopify order into dropshipping pipeline'
  );

  return createdOrder;
}
