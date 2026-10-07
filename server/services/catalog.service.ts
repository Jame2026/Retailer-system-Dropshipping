import { prisma } from '../database/client.js';
import { SupplierType } from '@prisma/client';

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

// Master dynamic catalog data
const BASE_CATALOG_PRODUCTS: StorefrontProduct[] = [
  {
    id: 'prod-1',
    sku: 'RET-WATCH-001-SLV',
    title: 'Minimalist Stainless Steel Watch - Silver',
    price: 44.75,
    originalPrice: 120.0,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    tag: 'NEW',
    category: 'Accessories',
    brand: 'Voisen Prime',
    rating: 4.9,
    description: 'Precision quartz movement with water-resistant 316L stainless steel case.',
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
    brand: 'Diesel Urban',
    rating: 4.8,
    description: 'High-density waterproof nylon with anti-theft RFID zipped compartments.',
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
    brand: 'Tommy Hilfiger',
    rating: 5.0,
    description: 'Thermal insulated fleece lining with windbreaker exterior.',
  },
  {
    id: 'prod-4',
    sku: 'RET-SHORTS-004-BLU',
    title: 'Classic Denim Casual Summer Shorts',
    price: 38.5,
    originalPrice: 56.0,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80',
    category: 'Clothings',
    brand: 'Calvin Klein',
    rating: 4.6,
    description: '100% breathable organic cotton denim tailored for summer comfort.',
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
    brand: 'Nike Fashion',
    rating: 4.7,
    description: 'Ergonomic breathable back panel with dedicated 16-inch laptop sleeve.',
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
    brand: 'Voisen Prime',
    rating: 4.9,
    description: 'Full-grain distressed leather crafted with double-stitched durability.',
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
    brand: 'Tommy Hilfiger',
    rating: 4.5,
    description: 'Classic unisex wool felt fedora with stylish adjustable inner ribbon.',
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
    brand: 'Nike Fashion',
    rating: 4.8,
    description: 'Ultra-lightweight memory foam cushioned insole for all-day comfort.',
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
    brand: 'Voisen Prime',
    rating: 4.9,
    description: 'Japanese multi-dial chronograph mechanism with scratch-resistant sapphire glass.',
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
    brand: 'Calvin Klein',
    rating: 4.9,
    description: 'UV400 anti-glare polarized lenses with durable alloy frames.',
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
    brand: 'Diesel Urban',
    rating: 4.7,
    description: '500 GSM French terry fleece cotton for a premium relaxed silhouette.',
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
    brand: 'Tommy Hilfiger',
    rating: 4.8,
    description: 'Hand-burnished genuine leather with elastic side gussets and rubber lug sole.',
  },
];

export class CatalogService {
  /**
   * Fetch all dynamic storefront products with filtering, search, pricing, and pagination
   */
  async getStorefrontProducts(options: StorefrontFilterOptions = {}) {
    let products = [...BASE_CATALOG_PRODUCTS];

    // Merge in any custom SKU mappings from database if they exist
    try {
      const dbMappings = await prisma.skuMapping.findMany({
        where: { isActive: true },
      });

      if (dbMappings.length > 0) {
        const dbProductMap = new Map(dbMappings.map((m) => [m.storeSku, m]));
        products = products.map((prod) => {
          const match = dbProductMap.get(prod.sku);
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
    } catch {
      // Fall back smoothly to memory products if database query fails
    }

    // Filter by category
    if (options.category && options.category.trim() && options.category.toLowerCase() !== 'all categories') {
      const catLower = options.category.toLowerCase().trim();
      products = products.filter((p) => {
        // Support matching 'Clothings', 'Lookbook' (maps to clothing/featured), etc.
        if (catLower === 'lookbook') return p.tag === 'HOT' || p.tag === 'SALE' || p.category.toLowerCase() === 'clothings';
        return p.category.toLowerCase() === catLower;
      });
    }

    // Filter by Tag (Popular, New, Sale, Hot)
    if (options.tag && options.tag.trim()) {
      const tagLower = options.tag.toLowerCase().trim();
      if (tagLower === 'popular') {
        products = products.filter((p) => (p.rating || 0) >= 4.7 || p.tag === 'HOT' || p.tag === 'NEW');
      } else {
        products = products.filter((p) => p.tag?.toLowerCase() === tagLower);
      }
    }

    // Filter by Brand
    if (options.brand && options.brand.trim() && options.brand.toLowerCase() !== 'all brands') {
      const brandLower = options.brand.toLowerCase().trim();
      products = products.filter((p) => p.brand?.toLowerCase() === brandLower);
    }

    // Filter by Search
    if (options.search && options.search.trim()) {
      const searchTerms = options.search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerms) ||
          p.sku.toLowerCase().includes(searchTerms) ||
          p.category.toLowerCase().includes(searchTerms) ||
          (p.brand && p.brand.toLowerCase().includes(searchTerms))
      );
    }

    // Filter by Price range
    if (options.maxPrice && options.maxPrice > 0) {
      products = products.filter((p) => p.price <= (options.maxPrice as number));
    }
    if (options.minPrice && options.minPrice > 0) {
      products = products.filter((p) => p.price >= (options.minPrice as number));
    }

    // Sort
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

    const total = products.length;
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 12);
    const paginatedItems = products.slice((page - 1) * limit, page * limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single product by ID or SKU
   */
  async getStorefrontProductById(idOrSku: string): Promise<StorefrontProduct | null> {
    const products = (await this.getStorefrontProducts({ limit: 100 })).items;
    return (
      products.find(
        (p) => p.id === idOrSku || p.sku.toLowerCase() === idOrSku.toLowerCase()
      ) || null
    );
  }

  /**
   * Get dynamic categories and brand counts
   */
  async getStorefrontMeta() {
    const allProducts = BASE_CATALOG_PRODUCTS;
    const categoryCounts: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};

    allProducts.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      if (p.brand) {
        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      }
    });

    const categories = [
      { name: 'All Categories', count: allProducts.length },
      ...Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
    ];

    const brands = [
      { name: 'All Brands', count: allProducts.length },
      ...Object.entries(brandCounts).map(([name, count]) => ({ name, count })),
    ];

    return {
      categories,
      brands,
      totalProducts: allProducts.length,
    };
  }
}

export const catalogService = new CatalogService();
