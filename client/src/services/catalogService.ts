import apiClient from './api.client.js';
import { ApiResponse, PaginatedData } from '../types/api.types.js';
import { SkuMapping, PricingFormulaInput, PricingFormulaResult } from '../types/catalog.types.js';
import { ProductItem } from '../components/storefront/ProductCard.js';

export interface StorefrontFilterParams {
  category?: string;
  tag?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface StorefrontMeta {
  categories: Array<{ name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  totalProducts: number;
}

export const MOCK_STOREFRONT_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    sku: 'RET-WATCH-001-SLV',
    title: 'Minimalist Stainless Steel Watch - Silver',
    price: 44.75,
    originalPrice: 120.0,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    tag: 'NEW',
    category: 'Accessories',
    rating: 4.9,
  },
  {
    id: 'prod-2',
    sku: 'RET-BAG-002-BLK',
    title: 'Waterproof Travel Crossbody Bag - Black',
    price: 31.75,
    originalPrice: 75.0,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    tag: 'NEW',
    category: 'Clothings',
    rating: 4.8,
  },
  {
    id: 'prod-3',
    sku: 'RET-JACKET-003-TAN',
    title: 'Winter Parka Fleece Hooded Jacket - Camel',
    price: 128.0,
    originalPrice: 280.0,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    tag: 'SALE',
    category: 'Clothings',
    rating: 5.0,
  },
  {
    id: 'prod-4',
    sku: 'RET-SHORTS-004-BLU',
    title: 'Classic Denim Casual Summer Shorts',
    price: 38.5,
    originalPrice: 56.0,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
    category: 'Clothings',
    rating: 4.6,
  },
  {
    id: 'prod-5',
    sku: 'RET-BAG-005-BLU',
    title: 'Urban Outdoor Daypack Canvas Backpack',
    price: 64.0,
    originalPrice: 110.0,
    image: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=600&q=80',
    tag: 'NEW',
    category: 'Bags & Packs',
    rating: 4.7,
  },
  {
    id: 'prod-6',
    sku: 'RET-LEATHER-006-BRN',
    title: 'Handcrafted Vintage Bifold Leather Wallet',
    price: 26.5,
    originalPrice: 50.0,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    tag: 'HOT',
    category: 'Accessories',
    rating: 4.9,
  },
  {
    id: 'prod-7',
    sku: 'RET-HAT-007-BLK',
    title: 'Wide Brim Wool Sun Fedora Hat - Black',
    price: 29.0,
    originalPrice: 48.0,
    image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=600&q=80',
    tag: 'NEW',
    category: 'Clothings',
    rating: 4.5,
  },
  {
    id: 'prod-8',
    sku: 'RET-SHOES-008-BLK',
    title: 'Minimal Slip-on Casual Canvas Loafers',
    price: 52.0,
    originalPrice: 85.0,
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
    tag: 'SALE',
    category: 'Footwear',
    rating: 4.8,
  },
  {
    id: 'prod-9',
    sku: 'RET-WATCH-009-GLD',
    title: 'Executive Chronograph Rose Gold Mesh Watch',
    price: 58.0,
    originalPrice: 140.0,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
    tag: 'NEW',
    category: 'Watches',
    rating: 4.9,
  },
  {
    id: 'prod-10',
    sku: 'RET-GLASSES-010-BLK',
    title: 'Polarized Aviator Sunglasses - Matte Black',
    price: 34.0,
    originalPrice: 79.0,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
    tag: 'HOT',
    category: 'Accessories',
    rating: 4.9,
  },
  {
    id: 'prod-11',
    sku: 'RET-HOODIE-011-GRY',
    title: 'Heavyweight Oversized Streetwear Hoodie - Ash Grey',
    price: 49.5,
    originalPrice: 95.0,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80',
    tag: 'NEW',
    category: 'Clothings',
    rating: 4.7,
  },
  {
    id: 'prod-12',
    sku: 'RET-BOOTS-012-BRN',
    title: 'Chelsea Leather Ankle Boots - Cognac Brown',
    price: 89.0,
    originalPrice: 165.0,
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80',
    tag: 'SALE',
    category: 'Footwear',
    rating: 4.8,
  },
];

export const MOCK_STOREFRONT_META: StorefrontMeta = {
  categories: [
    { name: 'Clothings', count: 4 },
    { name: 'Accessories', count: 3 },
    { name: 'Footwear', count: 2 },
    { name: 'Bags & Packs', count: 1 },
    { name: 'Watches', count: 2 },
  ],
  brands: [
    { name: 'Voisen Prime', count: 3 },
    { name: 'Tommy Hilfiger', count: 3 },
    { name: 'Nike Fashion', count: 2 },
    { name: 'Calvin Klein', count: 2 },
    { name: 'Diesel Urban', count: 2 },
  ],
  totalProducts: 12,
};

function filterFallbackProducts(params?: StorefrontFilterParams): PaginatedData<ProductItem> {
  let list = [...MOCK_STOREFRONT_PRODUCTS];

  if (params?.category && params.category.trim() && params.category.toLowerCase() !== 'all categories') {
    const cat = params.category.toLowerCase().trim();
    list = list.filter((p) => p.category.toLowerCase() === cat);
  }

  if (params?.tag && params.tag.trim()) {
    const t = params.tag.toLowerCase().trim();
    if (t === 'popular') {
      list = list.filter((p) => (p.rating || 0) >= 4.7 || p.tag === 'HOT' || p.tag === 'NEW');
    } else {
      list = list.filter((p) => p.tag?.toLowerCase() === t);
    }
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (params?.maxPrice && params.maxPrice > 0) {
    list = list.filter((p) => p.price <= params.maxPrice!);
  }

  if (params?.minPrice && params.minPrice > 0) {
    list = list.filter((p) => p.price >= params.minPrice!);
  }

  if (params?.sortBy) {
    if (params.sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (params.sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
  }

  const limit = params?.limit || 12;
  const page = params?.page || 1;
  const items = list.slice(0, limit);

  return {
    items,
    total: list.length,
    page,
    limit,
    totalPages: Math.ceil(list.length / limit) || 1,
  };
}

export const catalogService = {

  async getStorefrontProducts(
    params?: StorefrontFilterParams
  ): Promise<PaginatedData<ProductItem>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedData<ProductItem>>>(
        '/api/catalog/products',
        { params }
      );
      if (response.data.data?.items && response.data.data.items.length > 0) {
        return response.data.data;
      }
      return filterFallbackProducts(params);
    } catch {
      return filterFallbackProducts(params);
    }
  },

  async getStorefrontProductById(id: string): Promise<ProductItem | null> {
    try {
      const response = await apiClient.get<ApiResponse<ProductItem>>(
        `/api/catalog/products/${id}`
      );
      if (response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }
    return MOCK_STOREFRONT_PRODUCTS.find((p) => p.id === id || p.sku === id) || null;
  },

  async getStorefrontMeta(): Promise<StorefrontMeta> {
    try {
      const response = await apiClient.get<ApiResponse<StorefrontMeta>>(
        '/api/catalog/categories'
      );
      if (response.data.data && response.data.data.categories?.length > 0) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }
    return MOCK_STOREFRONT_META;
  },

  async getMappings(page = 1, limit = 50): Promise<PaginatedData<SkuMapping>> {
    const response = await apiClient.get<ApiResponse<PaginatedData<SkuMapping>>>('/api/catalog/mappings', {
      params: { page, limit },
    });
    return response.data.data || { items: [], total: 0, page: 1, limit: 50, totalPages: 1 };
  },

  async saveMapping(mapping: Partial<SkuMapping>): Promise<SkuMapping> {
    const response = await apiClient.post<ApiResponse<SkuMapping>>('/api/catalog/mappings', mapping);
    return response.data.data as SkuMapping;
  },

  async deleteMapping(id: string): Promise<void> {
    await apiClient.delete(`/api/catalog/mappings/${id}`);
  },

  async calculatePricePreview(payload: PricingFormulaInput): Promise<PricingFormulaResult> {
    const response = await apiClient.post<ApiResponse<PricingFormulaResult>>('/api/catalog/pricing-preview', payload);
    return response.data.data as PricingFormulaResult;
  },
};
