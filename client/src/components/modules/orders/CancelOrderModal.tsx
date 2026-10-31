import React, { useState } from 'react';
import { Dialog } from '../../common/Dialog.js';
import { Button } from '../../common/Button.js';
import { orderService } from '../../../services/orderService.js';
import { useNotification } from '../../../context/NotificationContext.js';
import { AlertTriangle, Ban } from 'lucide-react';

export interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  supplierOrderId?: string | null;
  onSuccess: () => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  supplierOrderId,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const [reason, setReason] = useState('Customer requested cancellation');
  const [loading, setLoading] = useState(false);

  const predefinedReasons = [
    'Customer requested cancellation',
    'Customer provided invalid delivery address',
    'Item discontinued or out of stock',
    'Suspicious or fraudulent transaction',
    'Duplicate order created by customer',
  ];

  const handleCancel = async () => {
    try {
      setLoading(true);
      await orderService.manualOverride({
        orderId,
        action: 'CANCEL',
        notes: reason.trim() || 'Cancelled by admin',
      });

      showToast(
        'success',
        'Order Cancelled',
        `Order ${orderNumber} cancelled and removed from fulfillment pipeline.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Cancellation Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Cancel Order ${orderNumber}`}
      description="Stop processing, abort safety hold, and release factory reservation."
      maxWidth="md"
    >
      <div className="space-y-4 text-slate-800">
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>
            {supplierOrderId ? (
              <>
                This order was already created with CJ Dropshipping (ID: <strong>{supplierOrderId}</strong>).
                Cancelling will automatically delete the order from the supplier factory.
              </>
            ) : (
              'This order is currently pending and has not yet been charged or fulfilled by suppliers.'
            )}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Cancellation Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-600 shadow-sm mb-2"
          >
            {predefinedReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Custom reason or merchant notes..."
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose}>
            Keep Order
          </Button>
          <Button variant="danger" isLoading={loading} onClick={handleCancel}>
            <Ban className="w-3.5 h-3.5" />
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
