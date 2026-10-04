import { z } from 'zod';

export const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address1: z.string().min(1, 'Address line 1 is required'),
  address2: z.string().nullable().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'State / Province is required'),
  province_code: z.string().optional().nullable(),
  zip: z.string().min(5, 'Valid 5-digit ZIP code is required'),
  country: z.string().default('United States'),
  country_code: z.string().default('US'),
  phone: z.string().nullable().optional(),
});

export const orderLineItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  product_id: z.union([z.string(), z.number()]).optional().nullable(),
  variant_id: z.union([z.string(), z.number()]),
  title: z.string().min(1),
  variant_title: z.string().nullable().optional(),
  sku: z.string().min(1, 'Store SKU is required'),
  quantity: z.number().int().positive(),
  price: z.union([z.string(), z.number()]),
});

export const shopifyOrderWebhookSchema = z.object({
  id: z.union([z.string(), z.number()]),
  admin_graphql_api_id: z.string().optional(),
  name: z.string(),
  order_number: z.union([z.string(), z.number()]),
  created_at: z.string(),
  cancelled_at: z.string().nullable().optional(),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  currency: z.string().default('USD'),
  total_price: z.union([z.string(), z.number()]),
  subtotal_price: z.union([z.string(), z.number()]),
  financial_status: z.string(),
  shipping_address: addressSchema.optional().nullable(),
  line_items: z.array(orderLineItemSchema).min(1, 'At least one line item is required'),
});

export const manualOrderOverrideSchema = z.object({
  orderId: z.string().uuid(),
  action: z.enum(['RELEASE_NOW', 'CANCEL', 'RETRY_DISPATCH', 'SWITCH_SUPPLIER', 'SET_MANUAL_REVIEW']),
  targetSupplier: z.enum(['CJ', 'ZENDROP', 'CUSTOM']).optional(),
  notes: z.string().optional(),
});
