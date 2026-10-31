import { z } from 'zod';

export const calculateFreightSchema = z.object({
  startCountryCode: z.string().optional().default('CN'),
  endCountryCode: z.string().min(2).max(4),
  products: z
    .array(
      z.object({
        vid: z.string().optional(),
        pid: z.string().optional(),
        sku: z.string().optional(),
        variantSku: z.string().optional(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .min(1),
});

export type CalculateFreightInput = z.infer<typeof calculateFreightSchema>;
