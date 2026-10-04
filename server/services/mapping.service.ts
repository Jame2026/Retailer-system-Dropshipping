import { prisma } from '../database/client.js';
import { SupplierType } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { CreateSkuMappingDTO } from '../types/order.types.js';
import { pricingService } from './pricing.service.js';

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
  /**
   * Resolves a store SKU to the appropriate supplier variant
   * Tries Priority 1 (Primary) first; if forceBackup or primary missing, uses Priority 2 (Backup)
   */
  async resolveSku(storeSku: string, useBackup: boolean = false): Promise<ResolvedSupplierSKU | null> {
    const mapping = await prisma.skuMapping.findUnique({
      where: { storeSku, isActive: true },
    });

    if (!mapping) {
      logger.warn({ storeSku }, 'No active SKU mapping found for store SKU');
      return null;
    }

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

    return null;
  }

  /**
   * Upsert a SKU Mapping with auto price calculation
   */
  async upsertMapping(data: CreateSkuMappingDTO) {
    const calculated = pricingService.calculateSellingPrice({
      baseCost: data.primaryCostPrice,
      shippingCost: data.primaryShippingCost ?? 0,
      multiplier: data.markupMultiplier,
      buffer: data.shippingBufferUsd,
    });

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
        calculatedSellingPrice: calculated.sellingPrice,
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
        calculatedSellingPrice: calculated.sellingPrice,
      },
    });

    return mapping;
  }

  /**
   * List SKU mappings
   */
  async listMappings(page = 1, limit = 50) {
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

export const mappingService = new MappingService();
