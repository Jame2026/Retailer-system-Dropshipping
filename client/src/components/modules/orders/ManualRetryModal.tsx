import React, { useState } from 'react';
import { Dialog } from '../../common/Dialog.js';
import { Select } from '../../common/Select.js';
import { Button } from '../../common/Button.js';
import { SupplierType } from '../../../types/order.types.js';
import { orderService } from '../../../services/orderService.js';
import { useNotification } from '../../../context/NotificationContext.js';
import { Send, AlertTriangle } from 'lucide-react';

export interface ManualRetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  currentSupplier?: SupplierType | null;
  onSuccess: () => void;
}

export const ManualRetryModal: React.FC<ManualRetryModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  currentSupplier,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierType>(currentSupplier || 'CJ');
  const [actionType, setActionType] = useState<'RELEASE_NOW' | 'RETRY_DISPATCH' | 'SWITCH_SUPPLIER'>('RETRY_DISPATCH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const supplierOptions = [
    { value: 'CJ', label: 'CJ Dropshipping (Primary Priority 1)' },
    { value: 'ZENDROP', label: 'Zendrop (Backup Fallback Priority 2)' },
  ];

  const handleExecute = async () => {
    try {
      setLoading(true);
      await orderService.manualOverride({
        orderId,
        action: actionType,
        targetSupplier: selectedSupplier,
        notes,
      });

      showToast(
        'success',
        'Dispatch Triggered',
        `Order ${orderNumber} queued for dispatch with ${selectedSupplier}.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Override Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Force Manual Dispatch — Order ${orderNumber}`}
      description="Manually override the 6-hour hold buffer or retry failed billing/fulfillment."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            Executing a manual override immediately creates a purchase order on the selected supplier factory.
          </span>
        </div>

        <Select
          label="Target Supplier"
          value={selectedSupplier}
          options={supplierOptions}
          onChange={(e) => setSelectedSupplier(e.target.value as SupplierType)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Action Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActionType('RELEASE_NOW')}
              className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                actionType === 'RELEASE_NOW'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              🚀 Release Hold Now
            </button>
            <button
              type="button"
              onClick={() => setActionType('RETRY_DISPATCH')}
              className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                actionType === 'RETRY_DISPATCH'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              🔄 Retry Dispatch
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Admin Reason / Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Customer verified address via support ticket"
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" isLoading={loading} onClick={handleExecute}>
            <Send className="w-3.5 h-3.5" />
            Execute Dispatch
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
