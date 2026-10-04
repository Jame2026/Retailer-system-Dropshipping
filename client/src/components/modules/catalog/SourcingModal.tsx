import React, { useState } from 'react';
import { Dialog } from '../../common/Dialog.js';
import { Input } from '../../common/Input.js';
import { Select } from '../../common/Select.js';
import { Button } from '../../common/Button.js';
import { sourcingService } from '../../../services/sourcingService.js';
import { useNotification } from '../../../context/NotificationContext.js';
import { Compass, Sparkles } from 'lucide-react';

export interface SourcingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SourcingModal: React.FC<SourcingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useNotification();
  const [productUrl, setProductUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  const [estimatedDailyOrders, setEstimatedDailyOrders] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [supplierType, setSupplierType] = useState<'CJ' | 'ZENDROP'>('CJ');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl) {
      showToast('warning', 'URL Required', 'Please enter a product link (AliExpress, 1688, Taobao, or Amazon).');
      return;
    }

    try {
      setLoading(true);
      await sourcingService.submitSourcingRequest({
        productUrl,
        targetPrice: targetPrice ? Number(targetPrice) : undefined,
        estimatedDailyOrders: estimatedDailyOrders ? Number(estimatedDailyOrders) : undefined,
        notes,
        supplierType,
      });

      showToast(
        'success',
        'Sourcing Request Dispatched',
        `Dispatched to ${supplierType} factory agents. You will receive a quotation within 24 hours.`
      );
      setProductUrl('');
      setTargetPrice('');
      setEstimatedDailyOrders('');
      setNotes('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Sourcing Request Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="1-Click Factory Sourcing Request"
      description="Submit any competitor or supplier link for direct wholesale quotation & factory mapping."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Product URL (AliExpress / 1688 / Taobao / Amazon / Competitor)"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://www.aliexpress.us/item/325680123456.html"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Target Wholesale Cost ($ USD)"
            type="number"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : '')}
            placeholder="e.g. 12.50"
          />

          <Input
            label="Est. Daily Order Volume"
            type="number"
            value={estimatedDailyOrders}
            onChange={(e) => setEstimatedDailyOrders(e.target.value ? Number(e.target.value) : '')}
            placeholder="e.g. 50"
          />
        </div>

        <Select
          label="Preferred Sourcing Supplier"
          value={supplierType}
          options={[
            { value: 'CJ', label: 'CJ Dropshipping (Fast 24h Factory Match)' },
            { value: 'ZENDROP', label: 'Zendrop Direct Warehouse' },
          ]}
          onChange={(e) => setSupplierType(e.target.value as 'CJ' | 'ZENDROP')}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Custom Requirements / Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Need US plug adapter, custom black packaging box, English user manual."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            <Sparkles className="w-3.5 h-3.5" />
            Dispatch Sourcing Request
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
