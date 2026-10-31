import { prisma } from '../database/client.js';
import { SupplierType } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { CreateSkuMappingDTO } from '../types/order.types.js';
import { pricingService } from './pricing.service.js';
import { cjProductService } from '../integrations/cj/cj.product.js';

export interface ResolvedSupplierSKU {
  supplier: SupplierType;
  supplierSku: string;
  supplierPid?: string | null;
  supplierVid?: string | null;
  costPrice: number;
  shippingCost: number;
  priority: 1 | 2;
}

export class MappingService {

  async resolveSku(storeSku: string, useBackup: boolean = false): Promise<ResolvedSupplierSKU | null> {
    const mapping = await prisma.skuMapping.findUnique({
      where: { storeSku, isActive: true },
    });

    if (mapping) {
      if (!useBackup && mapping.primarySupplierSku) {
        return {
          supplier: mapping.primarySupplier,
          supplierSku: mapping.primarySupplierSku,
          supplierPid: mapping.primarySupplierPid,
          supplierVid: mapping.primarySupplierVid,
          costPrice: mapping.primaryCostPrice,
          shippingCost: mapping.primaryShippingCost,
          priority: 1,
        };
      }

      if (mapping.backupSupplierSku && mapping.backupSupplier) {
        return {
          supplier: mapping.backupSupplier,
          supplierSku: mapping.backupSupplierSku,
          supplierPid: mapping.backupSupplierPid,
          supplierVid: mapping.backupSupplierVid,
          costPrice: mapping.backupCostPrice || mapping.primaryCostPrice,
          shippingCost: mapping.backupShippingCost || mapping.primaryShippingCost,
          priority: 2,
        };
      }
    }

    // All products from the CJ API are automatically added to the store
    const cleanedSku = storeSku.replace(/^CJ-/, '');
    return {
      supplier: SupplierType.CJ,
      supplierSku: cleanedSku,
      supplierPid: cleanedSku,
      costPrice: 10.0,
      shippingCost: 3.5,
      priority: 1,
    };
  }

  async upsertMapping(data: CreateSkuMappingDTO) {
    const calculated = pricingService.calculateSellingPrice({
      baseCost: data.primaryCostPrice,
      shippingCost: data.primaryShippingCost ?? 0,
      multiplier: data.markupMultiplier,
      buffer: data.shippingBufferUsd,
      charmPricing: true,
    });
    const finalSellingPrice =
      typeof data.calculatedSellingPrice === 'number' && data.calculatedSellingPrice > 0
        ? Math.round(data.calculatedSellingPrice * 100) / 100
        : calculated.sellingPrice;

    const mapping = await prisma.skuMapping.upsert({
      where: { storeSku: data.storeSku },
      create: {
        storeSku: data.storeSku,
        productName: data.productName,
        primarySupplier: data.primarySupplier as SupplierType,
        primarySupplierSku: data.primarySupplierSku,
        primarySupplierPid: data.primarySupplierPid,
        primarySupplierVid: data.primarySupplierVid,
        primaryCostPrice: data.primaryCostPrice,
        primaryShippingCost: data.primaryShippingCost ?? 0,
        backupSupplier: (data.backupSupplier as SupplierType) || null,
        backupSupplierSku: data.backupSupplierSku,
        backupSupplierPid: data.backupSupplierPid,
        backupSupplierVid: data.backupSupplierVid,
        backupCostPrice: data.backupCostPrice,
        backupShippingCost: data.backupShippingCost ?? 0,
        markupMultiplier: data.markupMultiplier ?? 2.5,
        shippingBufferUsd: data.shippingBufferUsd ?? 3.0,
        calculatedSellingPrice: finalSellingPrice,
        isActive: true,
      },
      update: {
        productName: data.productName,
        primarySupplier: data.primarySupplier as SupplierType,
        primarySupplierSku: data.primarySupplierSku,
        primarySupplierPid: data.primarySupplierPid,
        primarySupplierVid: data.primarySupplierVid,
        primaryCostPrice: data.primaryCostPrice,
        primaryShippingCost: data.primaryShippingCost ?? 0,
        backupSupplier: (data.backupSupplier as SupplierType) || null,
        backupSupplierSku: data.backupSupplierSku,
        backupSupplierPid: data.backupSupplierPid,
        backupSupplierVid: data.backupSupplierVid,
        backupCostPrice: data.backupCostPrice,
        backupShippingCost: data.backupShippingCost ?? 0,
        markupMultiplier: data.markupMultiplier ?? 2.5,
        shippingBufferUsd: data.shippingBufferUsd ?? 3.0,
        calculatedSellingPrice: finalSellingPrice,
      },
    });

    await prisma.productVariant.updateMany({
      where: { skuMappingId: mapping.id },
      data: { price: finalSellingPrice },
    });

    return mapping;
  }

  async listMappings(page = 1, limit = 50) {
    try {
      const cjData = await cjProductService.listProducts({
        page,
        size: limit,
      });

      const dbMappings = await prisma.skuMapping.findMany();
      const dbMap = new Map(dbMappings.map((m) => [m.storeSku, m]));
      const dbPidMap = new Map(
        dbMappings.filter((m) => m.primarySupplierPid).map((m) => [m.primarySupplierPid, m])
      );

      const cjItems = (cjData.items || []).map((cj) => {
        const storeSku = cj.sku || `CJ-${cj.id.slice(-8)}`;
        const existing = dbMap.get(storeSku) || dbPidMap.get(cj.id);
        if (existing) {
          return { ...existing, productImage: cj.image };
        }

        return {
          id: cj.id,
          storeSku,
          productName: cj.title,
          productImage: cj.image,
          primarySupplier: SupplierType.CJ,
          primarySupplierSku: cj.sku || cj.id,
          primarySupplierPid: cj.id,
          primarySupplierVid: null,
          primaryCostPrice: Number(cj.wholesaleCost || 10.0),
          primaryShippingCost: 3.5,
          backupSupplier: null,
          backupSupplierSku: null,
          backupSupplierPid: null,
          backupSupplierVid: null,
          backupCostPrice: null,
          backupShippingCost: 0,
          markupMultiplier: pricingService.getGlobalRules().globalMultiplier,
          shippingBufferUsd: pricingService.getGlobalRules().shippingBuffer,
          calculatedSellingPrice: Number(cj.price || 28.5),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      const total = cjData.total || cjItems.length;

      return {
        items: cjItems,
        total,
        page,
        limit,
        totalPages: cjData.totalPages || Math.ceil(total / limit) || 1,
      };
    } catch {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        prisma.skuMapping.findMany({
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.skuMapping.count(),
      ]);

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
  }
}

export const mappingService = new MappingService();
