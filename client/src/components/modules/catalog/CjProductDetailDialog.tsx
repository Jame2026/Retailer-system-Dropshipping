import React, { useState } from 'react';
import { Dialog } from '../../common/Dialog.js';
import { ProductDetailSkeleton } from '../../common/ProductDetailSkeleton.js';
import { Copy, Check } from 'lucide-react';
import { calculateRetailPrice } from '../../../utils/pricing.js';
import { FALLBACK_PRODUCT_IMAGE } from '../../../config/constants.js';
import { CjProductDetail } from '../../../types/catalog.types.js';
import { CjProductVariantsTable } from './CjProductVariantsTable.js';
import { CjProductDetailInfo } from './CjProductDetailInfo.js';

export interface CjProductDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productDetail: CjProductDetail | null;
  isLoading: boolean;
}

export const CjProductDetailDialog: React.FC<CjProductDetailDialogProps> = ({
  isOpen,
  onClose,
  productDetail,
  isLoading,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    setSelectedImage(null);
    setCopiedKey(null);
  }, [productDetail?.pid, isOpen]);

  const activeImage = selectedImage || productDetail?.productImage || FALLBACK_PRODUCT_IMAGE;
  const sellPrice = productDetail?.sellPrice || 10.0;
  const retailPrice = calculateRetailPrice(sellPrice);
  const mainSku = productDetail?.productSku || productDetail?.pid || '';

  const handleCopySku = async (sku: string, key = 'main') => {
    if (!sku) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(sku);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = sku;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy SKU', err);
    }
  };

  const dialogDescription = productDetail ? (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span>CJ Dropshipping SKU:</span>
      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
        {mainSku}
      </span>
      <button
        type="button"
        onClick={() => handleCopySku(mainSku, 'header')}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 transition-colors"
        title="Copy SKU"
        aria-label="Copy SKU"
      >
        {copiedKey === 'header' ? (
          <>
            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            <span className="text-emerald-700 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  ) : (
    'Loading specifications...'
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={productDetail ? productDetail.productName : 'Product Details'}
      description={dialogDescription}
      maxWidth="2xl"
    >
      {isLoading || !productDetail ? (
        <ProductDetailSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Gallery Preview */}
            <div className="space-y-3">
              <div className="h-64 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-2">
                <img
                  src={activeImage}
                  alt={productDetail.productName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {productDetail.productImageSet && productDetail.productImageSet.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {productDetail.productImageSet.slice(0, 6).map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-14 h-14 rounded-lg border overflow-hidden shrink-0 transition-all ${
                        activeImage === imgUrl
                          ? 'border-teal-600 ring-2 ring-teal-600/20'
                          : 'border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt="Thumbnail"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Pricing & Metadata */}
            <CjProductDetailInfo
              productDetail={productDetail}
              mainSku={mainSku}
              sellPrice={sellPrice}
              retailPrice={retailPrice}
              copiedKey={copiedKey}
              onCopySku={handleCopySku}
            />
          </div>

          {/* Variants Table with SKU copy */}
          <CjProductVariantsTable
            variants={productDetail.variants || []}
            basePrice={sellPrice}
            copiedKey={copiedKey}
            onCopySku={handleCopySku}
          />
        </div>
      )}
    </Dialog>
  );
};
