import { prisma } from '../database/client.js';
import { cjProductService } from '../integrations/cj/cj.product.js';
import { pricingService } from './pricing.service.js';

export interface StorefrontProduct {
  id: string;
  sku: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  tag?: 'NEW' | 'SALE' | 'HOT' | 'POPULAR';
  category: string;
  brand?: string;
  rating?: number;
  description?: string;
  inStock?: boolean;
  wholesaleCost?: number;
}

export interface StorefrontFilterOptions {
  category?: string;
  tag?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  page?: number;
  limit?: number;
}

export class CatalogService {
  async getStorefrontProducts(options: StorefrontFilterOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 16);

    try {
      const cjResult = await cjProductService.listProducts({
        keyWord: options.search || undefined,
        categoryId: options.category && options.category.toLowerCase() !== 'all categories' ? options.category : undefined,
        pageNum: page,
        pageSize: limit,
        minPrice: options.minPrice,
        maxPrice: options.maxPrice,
      });

      let products: StorefrontProduct[] = (cjResult.items || []).map((item) => ({
        id: item.id,
        sku: item.sku,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        tag: (item.tag as any) || (item.wholesaleCost && item.wholesaleCost > 40 ? 'HOT' : 'NEW'),
        category: item.category || 'General',
        brand: item.brand || 'CJ Factory Wholesale',
        rating: item.rating || 4.8,
        wholesaleCost: item.wholesaleCost,
        inStock: true,
      }));

      // Overlay customized SKU mappings from local database
      try {
        const dbMappings = await prisma.skuMapping.findMany({
          where: { isActive: true },
        });

        if (dbMappings.length > 0) {
          const dbProductMap = new Map(dbMappings.map((m) => [m.storeSku, m]));
          products = products.map((prod) => {
            const match = dbProductMap.get(prod.sku) || dbProductMap.get(`CJ-${prod.sku}`);
            if (match) {
              return {
                ...prod,
                title: match.productName || prod.title,
                price: match.calculatedSellingPrice || prod.price,
              };
            }
            return prod;
          });
        }
      } catch (dbErr) {
        // Keep real CJ products
      }

      if (options.tag) {
        const queryTag = options.tag.toLowerCase();
        products = products.filter((p) => p.tag && p.tag.toLowerCase().includes(queryTag));
      }

      if (options.sortBy) {
        switch (options.sortBy) {
          case 'price-asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            products.sort((a, b) => (b.tag === 'NEW' ? 1 : 0) - (a.tag === 'NEW' ? 1 : 0));
            break;
          case 'featured':
          default:
            products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        }
      }

      const total = cjResult.total || products.length;

      return {
        items: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error: any) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
      };
    }
  }

  async getStorefrontProductById(idOrSku: string): Promise<StorefrontProduct | null> {
    try {
      const detail = await cjProductService.getProductDetail(idOrSku);
      if (detail) {
        const pricing = pricingService.calculateSellingPrice({
          baseCost: detail.sellPrice,
          shippingCost: 3.5,
        });

        return {
          id: detail.pid,
          sku: detail.productSku || detail.pid,
          title: detail.productNameEn || detail.productName,
          price: pricing.sellingPrice,
          originalPrice: Math.round(pricing.sellingPrice * 1.5 * 100) / 100,
          image: detail.productImage,
          category: detail.categoryName || 'General',
          brand: 'CJ Factory Wholesale',
          rating: 4.8,
          description: detail.description,
          inStock: true,
          wholesaleCost: detail.sellPrice,
        };
      }
    } catch (err) {
      // Continue
    }

    return null;
  }

  async getStorefrontMeta() {
    try {
      const cats = await cjProductService.getCategories();
      const categories = [
        { name: 'All Categories', count: 4000, id: '' },
        ...cats.map((c) => ({
          name: c.categoryName,
          count: (c.children?.length || 0) + 120,
          id: c.categoryId,
        })),
      ];

      const brands = [
        { name: 'All Brands', count: 6000 },
        { name: 'CJ Factory Wholesale', count: 4200 },
        { name: 'Global Direct Hub', count: 1800 },
      ];

      return {
        categories,
        brands,
        totalProducts: 6000,
      };
    } catch {
      return {
        categories: [{ name: 'All Categories', count: 0 }],
        brands: [{ name: 'All Brands', count: 0 }],
        totalProducts: 0,
      };
    }
  }
}

export const catalogService = new CatalogService();
