import { z } from 'zod';

export const addressEditSchema = z.object({
  shippingName: z.string().min(2, 'Recipient name is required'),
  shippingAddress1: z.string().min(3, 'Street address is required'),
  shippingAddress2: z.string().optional().nullable(),
  shippingCity: z.string().min(2, 'City is required'),
  shippingProvince: z.string().min(2, 'State / Province is required'),
  shippingZip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Must be a valid 5-digit US ZIP code'),
  customerPhone: z.string().optional().nullable(),
});

export type AddressEditFormData = z.infer<typeof addressEditSchema>;
