export interface CJCategoryItem {
  categoryId: string;
  categoryName: string;
  categoryNameEn?: string;
  categoryLevel: number;
  parentId?: string;
  categoryImage?: string;
  children?: CJCategoryItem[];
}

export interface CJProductListParams {
  keyWord?: string;
  keyword?: string;
  categoryId?: string;
  page?: number;
  pageNum?: number;
  size?: number;
  pageSize?: number;
  countryCode?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CJProductVariant {
  vid: string;
  pid: string;
  variantSku: string;
  variantName: string;
  variantImage: string;
  variantPrice: number;
  variantStandard?: string;
  variantWeight?: number;
  inventory?: number;
}

export interface CJProductDetail {
  pid: string;
  productName: string;
  productNameEn?: string;
  productSku: string;
  productImage: string;
  productImageSet?: string[];
  productType?: string;
  productWeight?: number;
  productUnit?: string;
  categoryId?: string;
  categoryName?: string;
  sellPrice: number;
  description?: string;
  variants: CJProductVariant[];
}

export const DEFAULT_CJ_CATEGORIES: CJCategoryItem[] = [
  { categoryId: '', categoryName: 'All Categories', categoryLevel: 1 },
  { categoryId: '2FE8A083-5E7B-4179-896D-561EA116F730', categoryName: "Women's Clothing", categoryLevel: 1 },
  { categoryId: 'B8302697-CF47-4211-9BD0-DFE8995AEB30', categoryName: "Men's Clothing", categoryLevel: 1 },
  { categoryId: '2409110611570657700', categoryName: 'Pet Supplies', categoryLevel: 1 },
  { categoryId: '52FC6CA5-669B-4D0B-B1AC-415675931399', categoryName: 'Home & Garden', categoryLevel: 1 },
  { categoryId: '2C7D4A0B-1AB2-41EC-8F9E-13DC31B1C902', categoryName: 'Health & Beauty', categoryLevel: 1 },
  { categoryId: '2837816E-2FEA-4455-845C-6F40C6D70D1E', categoryName: 'Jewelry & Watches', categoryLevel: 1 },
  { categoryId: '2415A90C-5D7B-4CC7-BA8C-C0949F9FF5D8', categoryName: 'Bags & Shoes', categoryLevel: 1 },
  { categoryId: 'A50A92FA-BCB3-4716-9BD9-BEC629BEE735', categoryName: 'Toys, Kids & Baby', categoryLevel: 1 },
  { categoryId: '4B397425-26C1-4D0E-B6D2-96B0B03689DB', categoryName: 'Sports & Outdoors', categoryLevel: 1 },
  { categoryId: 'D9E66BF8-4E81-4CAB-A425-AEDEC5FBFBF2', categoryName: 'Consumer Electronics', categoryLevel: 1 },
  { categoryId: 'E9FDC79A-8365-4CA6-AC23-64D971F08B8B', categoryName: 'Phones & Accessories', categoryLevel: 1 },
  { categoryId: '1126E280-CB7D-418A-90AB-7118E2D97CCC', categoryName: 'Computer & Office', categoryLevel: 1 },
  { categoryId: '6A5D2EB4-13BD-462E-A627-78CFED11B2A2', categoryName: 'Home Improvement', categoryLevel: 1 },
  { categoryId: 'A2F799BE-FB59-428E-A953-296AA2673FCF', categoryName: 'Automobiles & Motorcycles', categoryLevel: 1 },
];
