import { cjClient } from './cj.client.js';
import { logger } from '../../utils/logger.js';
import { cjMemoryCache } from '../../utils/memoryCache.js';
import {
  CJCategoryItem,
  CJProductListParams,
  CJProductVariant,
  CJProductDetail,
  DEFAULT_CJ_CATEGORIES,
} from './cj.types.js';
import {
  transformCjListItem,
  transformCjDetail,
  resolveCjCategoryId,
} from './cj.product.utils.js';
import { registerCjCategoryTree } from './cj.category.mapper.js';

export type {
  CJCategoryItem,
  CJProductListParams,
  CJProductVariant,
  CJProductDetail,
};

export class CJProductService {
  async getCategories(): Promise<CJCategoryItem[]> {
    return cjMemoryCache.fetchOrDedupe('cj_categories', 3600_000, async () => {
      try {
        logger.info('Fetching live product categories from CJ Dropshipping API...');
        const response = await cjClient.request('/product/getCategory', 'GET');
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          registerCjCategoryTree(response.data);
          return response.data.map((cat: any) => ({
            categoryId: cat.categoryFirstId || cat.categoryId || String(cat.id),
            categoryName: cat.categoryFirstName || cat.categoryName || 'Category',
            categoryLevel: 1,
            children: (cat.categoryFirstList || cat.children || []).map((sub: any) => ({
              categoryId: sub.categorySecondId || sub.categoryId || String(sub.id),
              categoryName: sub.categorySecondName || sub.categoryName || 'Subcategory',
              categoryLevel: 2,
              parentId: cat.categoryFirstId || cat.categoryId,
            })),
          }));
        }
        return DEFAULT_CJ_CATEGORIES;
      } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to fetch live CJ categories, using defaults');
        return DEFAULT_CJ_CATEGORIES;
      }
    });
  }

  async listProducts(params: CJProductListParams = {}) {
    const page = Math.max(1, params.page || params.pageNum || 1);
    const size = Math.max(1, Math.min(100, params.size || params.pageSize || 20));
    const keyword = (params.keyWord || params.keyword || '').trim();
    const categoryId = resolveCjCategoryId(params.categoryId);
    const countryCode = params.countryCode ? params.countryCode.trim() : undefined;

    const cacheKey = `cj_list_${page}_${size}_${keyword}_${categoryId || 'all'}_${params.minPrice || 0}_${params.maxPrice || 0}_${countryCode || 'all'}`;

    return cjMemoryCache.fetchOrDedupe(cacheKey, 300_000, async () => {
      try {
        logger.info({ page, size, keyword, categoryId, countryCode }, 'Fetching products from CJ Dropshipping API');
        
        const queryParams: Record<string, any> = { pageNum: page, pageSize: size };
        if (countryCode) queryParams.countryCode = countryCode;
        if (keyword) queryParams.productNameEn = keyword;
        if (categoryId) queryParams.categoryId = categoryId;
        if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
        if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;

        let response = await cjClient.request('/product/list', 'GET', undefined, queryParams);

        const hasList = Array.isArray(response?.data?.list) && response.data.list.length > 0;
        const hasContent = Array.isArray(response?.data?.content) && response.data.content.length > 0;

        if (!hasList && !hasContent) {
          const v2Params: Record<string, any> = { page, size };
          if (countryCode) v2Params.countryCode = countryCode;
          if (keyword) v2Params.keyWord = keyword;
          if (categoryId) v2Params.categoryId = categoryId;
          const v2Res = await cjClient.request('/product/listV2', 'GET', undefined, v2Params);
          if (v2Res?.data?.content || v2Res?.data?.list) {
            response = v2Res;
          }
        }

        let rawItems: any[] = [];
        let totalCount = 0;
        let totalPages = 1;
        let currentPage = page;

        if (response?.data) {
          const d = response.data;
          totalCount = d.total ?? d.totalRecords ?? 0;
          currentPage = d.pageNum ?? d.pageNumber ?? page;
          const returnedSize = d.pageSize ?? size;
          totalPages = d.totalPages ?? (totalCount > 0 ? Math.ceil(totalCount / returnedSize) : 1);

          if (Array.isArray(d.list) && d.list.length > 0) {
            rawItems = d.list;
          } else if (Array.isArray(d.content)) {
            const first = d.content[0];
            if (first) {
              if (Array.isArray(first.productList)) {
                rawItems = first.productList;
                if (!totalCount) totalCount = first.total || first.productList.length;
              } else if (Array.isArray(first.content)) {
                rawItems = first.content;
                if (!totalCount) totalCount = first.total || first.content.length;
              } else if (first.id || first.pid || first.sku || first.nameEn) {
                rawItems = d.content;
              }
            }
          }
        }

        if (!totalCount && rawItems.length > 0) {
          totalCount = rawItems.length;
        }

        if (rawItems.length > 0) {
          const transformedItems = rawItems.map((item) => transformCjListItem(item, categoryId));

          return {
            items: transformedItems,
            total: totalCount,
            page: currentPage,
            limit: size,
            totalPages,
          };
        }

        return { items: [], total: totalCount, page: currentPage, limit: size, totalPages };
      } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to fetch CJ product list');
        return { items: [], total: 0, page: 1, limit: size, totalPages: 1 };
      }
    });
  }

  async getGlobalWarehouses() {
    return cjMemoryCache.fetchOrDedupe('cj_warehouses', 3600_000, async () => {
      try {
        logger.info('Fetching global warehouse list from CJ...');
        const response = await cjClient.request('/product/globalWarehouseList', 'GET');
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map((wh: any) => ({
            warehouseId: `wh-${wh.areaId || wh.warehouseId}`,
            warehouseName: `${wh.en || wh.nameEn || wh.countryCode} Warehouse`,
            countryCode: wh.countryCode || 'US',
            shippingDays: wh.countryCode === 'US' ? '3-5' : '5-10',
          }));
        }
        return response?.data || [];
      } catch (error: any) {
        logger.error({ error: error.message }, 'Failed to fetch CJ global warehouses');
        return [];
      }
    });
  }

  async getProductDetail(pid: string): Promise<CJProductDetail | null> {
    const cacheKey = `cj_detail_${pid}`;
    return cjMemoryCache.fetchOrDedupe(cacheKey, 1800_000, async () => {
      try {
        logger.info({ pid }, 'Querying product detail from CJ /product/query');
        const response = await cjClient.request('/product/query', 'GET', undefined, { pid });

        if (response?.data) {
          return transformCjDetail(response.data, pid);
        }
        return null;
      } catch (error: any) {
        logger.error({ pid, error: error.message }, 'Failed to query CJ product detail');
        return null;
      }
    });
  }
}

export const cjProductService = new CJProductService();
