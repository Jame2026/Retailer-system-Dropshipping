import { pricingService } from '../../services/pricing.service.js';
import { CJProductVariant, CJProductDetail } from './cj.types.js';
import { formatCategoryBreadcrumb, resolveCjCategoryId } from './cj.category.mapper.js';

export { resolveCjCategoryId, formatCategoryBreadcrumb };

export function parsePrice(priceVal: any): number {
  if (typeof priceVal === 'number' && !isNaN(priceVal)) return priceVal;
  if (typeof priceVal === 'string') {
    const match = priceVal.match(/[\d.]+/);
    if (match) {
      const parsed = parseFloat(match[0]);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 10.0;
}

export function cleanTitle(rawName: any, rawNameEn: any): string {
  if (rawNameEn && typeof rawNameEn === 'string' && rawNameEn.trim()) {
    return rawNameEn.trim();
  }
  if (rawName && typeof rawName === 'string') {
    if (rawName.startsWith('[') && rawName.endsWith(']')) {
      try {
        const parsed = JSON.parse(rawName);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
      } catch {
        // Keep rawName
      }
    }
    return rawName.trim();
  }
  return 'CJ Dropship Product';
}

const US_GOOGLE_TRENDING_KEYWORDS = [
  'watch', 'wireless', 'bluetooth', 'led', 'lamp', 'bag', 'phone', 'holder',
  'charger', 'beauty', 'massage', 'sunglasses', 'ring', 'hoodie', 'portable',
  'kitchen', 'cleaner', 'smart', 'organizer', 'earbuds', 'mini', 'strap',
  'bracelet', 'speaker', 'tumbler', 'fitness', 'wallet', 'necklace'
];

export function transformCjListItem(item: any, queryContextCategoryId?: string) {
  const wholesaleCost = parsePrice(item.sellPrice || item.price || item.nowPrice);
  const pricing = pricingService.calculateSellingPrice({
    baseCost: wholesaleCost,
    shippingCost: 3.5,
  });

  const title = cleanTitle(item.productName, item.nameEn || item.productNameEn);
  const titleLower = title.toLowerCase();
  const matchesUsTrending = US_GOOGLE_TRENDING_KEYWORDS.some((kw) => titleLower.includes(kw));

  let tag: string | undefined = undefined;
  if (item.isHot || item.isTrending) {
    tag = 'Trending';
  } else if (matchesUsTrending) {
    tag = 'Popular';
  } else if (item.isNew) {
    tag = 'NEW';
  }

  const rawCat = item.categoryName || item.oneCategoryName || item.twoCategoryName || item.threeCategoryName;
  const category = formatCategoryBreadcrumb(rawCat, item.categoryId, queryContextCategoryId);

  return {
    id: String(item.id || item.pid || `cj-${item.sku || item.productSku}`),
    sku: item.sku || item.productSku || String(item.id || item.pid),
    title,
    price: pricing.sellingPrice,
    originalPrice: Math.round(pricing.sellingPrice * 1.6 * 100) / 100,
    image: item.bigImage || item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    tag,
    isTrending: Boolean(item.isHot || matchesUsTrending),
    isPopular: Boolean(matchesUsTrending || item.isHot),
    category,
    brand: 'CJ Factory Wholesale',
    rating: 4.8,
    supplierPid: String(item.id || item.pid),
    wholesaleCost,
  };
}

export function transformCjDetail(d: any, fallbackPid: string): CJProductDetail {
  const rawVariants = d.variants || d.stanProducts || [];
  const variants: CJProductVariant[] = rawVariants.map((v: any) => ({
    vid: String(v.vid || v.id),
    pid: String(v.pid || d.pid || d.id || fallbackPid),
    variantSku: v.variantSku || v.sku || '',
    variantName: v.variantNameEn || v.nameen || v.variantName || v.name || v.variantKey || 'Standard',
    variantImage: v.variantImage || v.img || d.bigImage || d.bigimg || '',
    variantPrice: typeof v.variantSellPrice === 'number' ? v.variantSellPrice : parsePrice(v.variantSellPrice || v.sellprice),
    variantStandard: v.variantStandard || v.standard || '',
    variantWeight: v.variantWeight ? Number(v.variantWeight) : (v.weight ? Number(v.weight) : undefined),
    inventory: v.inventoryNum || v.totalInventory || v.inventory || 100,
  }));

  let imageSet: string[] = [];
  if (Array.isArray(d.productImageSet)) imageSet = d.productImageSet;
  else if (Array.isArray(d.img)) imageSet = d.img;
  else if (typeof d.img === 'string') imageSet = d.img.split(',').filter(Boolean);

  const rawCat = d.categoryName || d.category;
  const categoryName = formatCategoryBreadcrumb(rawCat, d.categoryId || d.categoryid);

  return {
    pid: String(d.pid || d.id || fallbackPid),
    productName: cleanTitle(d.productName || d.name, d.productNameEn || d.nameen),
    productNameEn: d.productNameEn || d.nameen || cleanTitle(d.productName || d.name, null),
    productSku: d.productSku || d.sku || '',
    productImage: d.bigImage || d.bigimg || d.productImage || (imageSet[0] || ''),
    productImageSet: imageSet,
    productType: d.productType || d.producttype || 'ORDINARY_PRODUCT',
    productWeight: d.productWeight ? Number(d.productWeight) : (d.weight ? Number(d.weight) : undefined),
    productUnit: d.productUnit || d.unit || undefined,
    categoryId: d.categoryId || d.categoryid || undefined,
    categoryName,
    sellPrice: parsePrice(d.sellPrice || d.sellprice),
    description: d.description || undefined,
    variants,
  };
}
