import React, { useState, useEffect } from 'react';
import { Dialog } from '../../common/Dialog.js';
import { Select } from '../../common/Select.js';
import { Badge } from '../../common/Badge.js';
import { Button } from '../../common/Button.js';
import { SupplierType } from '../../../types/order.types.js';
import { orderService } from '../../../services/orderService.js';
import { useNotification } from '../../../context/NotificationContext.js';
import { formatTimeRemaining } from '../../../utils/formatDate.js';
import { Zap, RotateCcw, ArrowLeftRight, AlertTriangle, Ban, Check, Clock } from 'lucide-react';

export type ActionType = 'RELEASE_NOW' | 'RETRY_DISPATCH' | 'SWITCH_SUPPLIER' | 'SET_MANUAL_REVIEW' | 'CANCEL';

export interface ManualRetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  orderStatus?: string;
  holdExpiresAt?: string | null;
  currentSupplier?: SupplierType | null;
  onSuccess: () => void;
}

export const ManualRetryModal: React.FC<ManualRetryModalProps> = ({
  isOpen, onClose, orderId, orderNumber, orderStatus, holdExpiresAt, currentSupplier, onSuccess,
}) => {
  const { showToast } = useNotification();
  const [supplier, setSupplier] = useState<SupplierType>(currentSupplier || 'CJ');
  const [actionType, setActionType] = useState<ActionType>('RELEASE_NOW');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderStatus === 'PENDING_HOLD') setActionType('RELEASE_NOW');
    else if (orderStatus === 'FAILED_BILLING' || orderStatus === 'MANUAL_REVIEW') setActionType('RETRY_DISPATCH');
    else setActionType('RETRY_DISPATCH');
  }, [orderStatus, isOpen]);

  const holdInfo = formatTimeRemaining(holdExpiresAt);

  const actions = [
    {
      id: 'RELEASE_NOW' as ActionType, title: 'Ship Now (Skip Hold)', icon: Zap, btnText: '⚡ Ship to Factory Now',
      desc: 'Bypass remaining safety hold time and submit directly to supplier factory right now.',
      variant: 'primary' as const, isRecommended: orderStatus === 'PENDING_HOLD',
      border: 'border-teal-500 bg-teal-50/60', iconColor: 'text-teal-600 bg-teal-100',
    },
    {
      id: 'RETRY_DISPATCH' as ActionType, title: 'Retry Factory Dispatch', icon: RotateCcw, btnText: '🔄 Retry Factory Dispatch',
      desc: 'Re-send order to factory (use after topping up CJ wallet or fixing network timeout).',
      variant: 'primary' as const, isRecommended: orderStatus === 'FAILED_BILLING' || orderStatus === 'MANUAL_REVIEW',
      border: 'border-blue-500 bg-blue-50/60', iconColor: 'text-blue-600 bg-blue-100',
    },
    {
      id: 'SWITCH_SUPPLIER' as ActionType, title: 'Switch Supplier Partner', icon: ArrowLeftRight, btnText: '🔀 Switch Supplier & Send',
      desc: 'Change fulfillment partner (e.g. route to Zendrop instead of CJ Dropshipping).',
      variant: 'primary' as const, isRecommended: false, border: 'border-indigo-500 bg-indigo-50/60', iconColor: 'text-indigo-600 bg-indigo-100',
    },
    {
      id: 'SET_MANUAL_REVIEW' as ActionType, title: 'Pause for Manual Review', icon: AlertTriangle, btnText: '⚠️ Put on Manual Review',
      desc: 'Freeze fulfillment so staff can verify customer address, phone, or SKU mapping.',
      variant: 'secondary' as const, isRecommended: false, border: 'border-amber-500 bg-amber-50/60', iconColor: 'text-amber-600 bg-amber-100',
    },
    {
      id: 'CANCEL' as ActionType, title: 'Cancel Order & Void', icon: Ban, btnText: '❌ Cancel & Void Order',
      desc: 'Cancel order in store and automatically delete from factory if already placed.',
      variant: 'danger' as const, isRecommended: false, border: 'border-rose-500 bg-rose-50/60', iconColor: 'text-rose-600 bg-rose-100',
    },
  ];

  const currentAction = actions.find((a) => a.id === actionType) || actions[0];

  const handleExecute = async () => {
    try {
      setLoading(true);
      await orderService.manualOverride({ orderId, action: actionType, targetSupplier: supplier, notes: notes.trim() || undefined });
      showToast('success', 'Action Completed', `Order ${orderNumber} updated successfully.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Order Actions — ${orderNumber}`} description="Update fulfillment routing, release hold, or resolve issues." maxWidth="lg">
      <div className="space-y-4 text-slate-800">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Status:</span>
            {orderStatus && <Badge status={orderStatus} />}
          </div>
          <div className="flex items-center gap-3">
            {orderStatus === 'PENDING_HOLD' && holdInfo.formatted && (
              <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-amber-600" /> {holdInfo.formatted}
              </span>
            )}
            <span className="text-slate-500">Supplier: <strong className="text-slate-800">{currentSupplier || 'CJ'}</strong></span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Choose Action to Perform</label>
          <div className="grid grid-cols-1 gap-2">
            {actions.map((act) => {
              const Icon = act.icon;
              const isSelected = actionType === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => setActionType(act.id)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected ? act.border : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${act.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{act.title}</span>
                        {act.isRecommended && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center ${
                    isSelected ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {actionType === 'SWITCH_SUPPLIER' && (
          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200">
            <Select
              label="Select New Fulfillment Partner"
              value={supplier}
              options={[
                { value: 'CJ', label: 'CJ Dropshipping (Primary Priority 1)' },
                { value: 'ZENDROP', label: 'Zendrop (Backup Fallback Priority 2)' },
              ]}
              onChange={(e) => setSupplier(e.target.value as SupplierType)}
            />
          </div>
        )}

        {actionType === 'CANCEL' && (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <Ban className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Cancelling will stop fulfillment and automatically remove the order from the CJ factory if placed.</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Internal Admin Note (Optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Customer approved address via support ticket"
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant={currentAction.variant} size="sm" isLoading={loading} onClick={handleExecute}>
            {currentAction.btnText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

