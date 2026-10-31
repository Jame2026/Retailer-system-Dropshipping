import { Request, Response, NextFunction } from 'express';
import { cjOrder } from '../integrations/cj/cj.order.js';
import { cjProductService } from '../integrations/cj/cj.product.js';
import { prisma } from '../database/client.js';
import { calculateFreightSchema } from '../validators/shipping.validator.js';

function parseDays(agingStr: string): { minDays: number; maxDays: number } {
  const parts = agingStr.split('-').map((p) => parseInt(p.trim(), 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { minDays: parts[0], maxDays: parts[1] };
  }
  const single = parseInt(agingStr, 10);
  if (!isNaN(single)) {
    return { minDays: single, maxDays: single };
  }
  return { minDays: 7, maxDays: 15 };
}

export class ShippingController {
  async calculateFreight(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = calculateFreightSchema.parse(req.body);

      // Resolve products to valid CJ VIDs
      const resolvedProducts = await Promise.all(
        validated.products.map(async (p) => {
          if (p.vid && p.vid.trim().length > 0) {
            return { vid: p.vid.trim(), quantity: p.quantity };
          }
          if (p.pid || p.sku) {
            const queryKey = p.pid || p.sku;
            const mapping = await prisma.skuMapping.findFirst({
              where: {
                OR: [
                  { storeSku: queryKey },
                  { primarySupplierPid: queryKey },
                  { primarySupplierSku: queryKey },
                ],
              },
            });
            if (mapping?.primarySupplierVid) {
              return { vid: mapping.primarySupplierVid, quantity: p.quantity };
            }
            if (p.pid) {
              try {
                const detail = await cjProductService.getProductDetail(p.pid);
                if (detail?.variants?.length) {
                  return { vid: detail.variants[0].vid, quantity: p.quantity };
                }
              } catch {
                // Fallback handled below
              }
            }
          }
          return { vid: '2610300340461623900', quantity: p.quantity };
        })
      );

      const data = await cjOrder.calculateFreight({
        startCountryCode: validated.startCountryCode || 'CN',
        endCountryCode: validated.endCountryCode,
        products: resolvedProducts,
      });

      const options = Array.isArray(data)
        ? data.map((item: any) => {
            const aging = item.logisticAging || '7-15';
            const { minDays, maxDays } = parseDays(aging);
            const name = item.logisticName || 'Standard Line';
            const totalFee = Number(item.totalPostageFee || item.logisticPrice || 0);

            let carrierCategory: 'express' | 'postal' | 'standard' | 'economy' = 'standard';
            if (/dhl|fedex|ups|express/i.test(name)) {
              carrierCategory = 'express';
            } else if (/usps|postal|royal mail/i.test(name)) {
              carrierCategory = 'postal';
            } else if (/sea|packet eub/i.test(name) || maxDays > 20) {
              carrierCategory = 'economy';
            }

            return {
              logisticName: name,
              logisticAging: aging,
              minDays,
              maxDays,
              logisticPrice: Number(item.logisticPrice || totalFee),
              totalFee,
              carrierCategory,
              trackingAvailable: true,
            };
          })
        : [];

      options.sort((a: any, b: any) => a.totalFee - b.totalFee);

      const fastestOption = options.reduce((best, curr) => {
        return curr.maxDays < (best?.maxDays ?? 999) ? curr : best;
      }, options[0]);

      const enriched = options.map((opt, idx) => {
        let carrierTag: string | undefined = undefined;
        if (idx === 0) {
          carrierTag = '🏆 Best Value';
        } else if (opt.logisticName === fastestOption?.logisticName) {
          carrierTag = '⚡ Fastest Delivery';
        } else if (/usps/i.test(opt.logisticName)) {
          carrierTag = '📮 US Postal';
        } else if (/yunexpress/i.test(opt.logisticName)) {
          carrierTag = '✈️ Air Direct';
        }

        return {
          ...opt,
          carrierTag,
          isBestValue: idx === 0,
          isFastest: opt.logisticName === fastestOption?.logisticName,
        };
      });

      return res.status(200).json({
        success: true,
        data: enriched,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const shippingController = new ShippingController();
