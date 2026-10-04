import { z } from 'zod';

export const pricingCalculatorSchema = z.object({
  baseCost: z.number().min(0, 'Base cost must be at least 0'),
  shippingCost: z.number().min(0, 'Shipping cost must be at least 0'),
  multiplier: z.number().min(1, 'Markup multiplier must be at least 1.0x'),
  buffer: z.number().min(0, 'Shipping buffer must be 0 or positive'),
});

export type PricingCalculatorFormData = z.infer<typeof pricingCalculatorSchema>;
