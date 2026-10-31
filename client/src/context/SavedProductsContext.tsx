import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductItem } from '../components/storefront/ProductCard.js';

interface SavedProductsContextValue {
  savedProducts: ProductItem[];
  isProductSaved: (idOrSku: string) => boolean;
  toggleSaveProduct: (product: ProductItem) => boolean;
  saveProduct: (product: ProductItem) => void;
  removeSavedProduct: (idOrSku: string) => void;
  clearSavedProducts: () => void;
  totalSaved: number;
}

const STORAGE_KEY = 'voisen_client_saved_products';

const DEFAULT_SAVED_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    sku: 'RET-WATCH-001-SLV',
    title: 'Minimalist Stainless Steel Watch - Silver',
    price: 44.75,
    originalPrice: 120.0,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    category: 'Accessories',
    tag: 'Popular',
    rating: 4.8,
  },
  {
    id: 'prod-3',
    sku: 'RET-LAMP-003-RGB',
    title: 'Multifunctional Wireless Charger RGB Lamp',
    price: 49.99,
    originalPrice: 89.0,
    image: 'https://cf.cjdropshipping.com/667bbd9d-e23d-453c-8f31-bd355107f90f.jpg',
    category: 'Electronics',
    tag: 'Trending',
    rating: 4.9,
  },
];

const SavedProductsContext = createContext<SavedProductsContextValue | undefined>(undefined);

export const SavedProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedProducts, setSavedProducts] = useState<ProductItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return DEFAULT_SAVED_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProducts));
    } catch {
      // Ignore storage errors
    }
  }, [savedProducts]);

  const isProductSaved = (idOrSku: string): boolean => {
    return savedProducts.some((p) => p.id === idOrSku || p.sku === idOrSku);
  };

  const saveProduct = (product: ProductItem) => {
    setSavedProducts((prev) => {
      if (prev.some((p) => p.id === product.id || p.sku === product.sku)) return prev;
      return [product, ...prev];
    });
  };

  const removeSavedProduct = (idOrSku: string) => {
    setSavedProducts((prev) => prev.filter((p) => p.id !== idOrSku && p.sku !== idOrSku));
  };

  const toggleSaveProduct = (product: ProductItem): boolean => {
    const exists = isProductSaved(product.id) || isProductSaved(product.sku);
    if (exists) {
      removeSavedProduct(product.id);
      return false;
    } else {
      saveProduct(product);
      return true;
    }
  };

  const clearSavedProducts = () => setSavedProducts([]);

  return (
    <SavedProductsContext.Provider
      value={{
        savedProducts,
        isProductSaved,
        toggleSaveProduct,
        saveProduct,
        removeSavedProduct,
        clearSavedProducts,
        totalSaved: savedProducts.length,
      }}
    >
      {children}
    </SavedProductsContext.Provider>
  );
};

export function useSavedProducts() {
  const context = useContext(SavedProductsContext);
  if (!context) throw new Error('useSavedProducts must be used within SavedProductsProvider');
  return context;
}
