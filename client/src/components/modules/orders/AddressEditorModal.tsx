import React, { useState } from 'react';
import { Dialog } from '../../common/Dialog.js';
import { Input } from '../../common/Input.js';
import { Select } from '../../common/Select.js';
import { Button } from '../../common/Button.js';
import { US_STATES } from '../../../config/constants.js';
import { addressEditSchema, AddressEditFormData } from '../../../validators/orderForm.validator.js';
import { useNotification } from '../../../context/NotificationContext.js';

export interface AddressEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  initialAddress: {
    shippingName: string;
    shippingAddress1: string;
    shippingAddress2?: string | null;
    shippingCity: string;
    shippingProvince: string;
    shippingZip: string;
    customerPhone?: string | null;
  };
  onSave: (data: AddressEditFormData) => Promise<void>;
}

export const AddressEditorModal: React.FC<AddressEditorModalProps> = ({
  isOpen,
  onClose,
  initialAddress,
  onSave,
}) => {
  const { showToast } = useNotification();
  const [formData, setFormData] = useState<AddressEditFormData>({
    shippingName: initialAddress.shippingName,
    shippingAddress1: initialAddress.shippingAddress1,
    shippingAddress2: initialAddress.shippingAddress2 || '',
    shippingCity: initialAddress.shippingCity,
    shippingProvince: initialAddress.shippingProvince,
    shippingZip: initialAddress.shippingZip,
    customerPhone: initialAddress.customerPhone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stateOptions = US_STATES.map((s) => ({
    value: s.name,
    label: `${s.name} (${s.code})`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = addressEditSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(result.data);
      showToast('success', 'Address Updated', 'Customer US address has been cleaned and saved.');
      onClose();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit US Customer Address"
      description="Clean and validate recipient delivery address before factory dispatch."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Recipient Full Name"
          value={formData.shippingName}
          onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
          error={errors.shippingName}
          placeholder="e.g. John Doe"
        />

        <Input
          label="Street Address Line 1"
          value={formData.shippingAddress1}
          onChange={(e) => setFormData({ ...formData, shippingAddress1: e.target.value })}
          error={errors.shippingAddress1}
          placeholder="e.g. 742 Evergreen Terrace"
        />

        <Input
          label="Apartment / Suite / Unit (Optional)"
          value={formData.shippingAddress2 || ''}
          onChange={(e) => setFormData({ ...formData, shippingAddress2: e.target.value })}
          placeholder="e.g. Apt 4B"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            value={formData.shippingCity}
            onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
            error={errors.shippingCity}
            placeholder="Springfield"
          />

          <Select
            label="State / Province"
            value={formData.shippingProvince}
            options={stateOptions}
            onChange={(e) => setFormData({ ...formData, shippingProvince: e.target.value })}
            error={errors.shippingProvince}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="5-Digit US ZIP Code"
            value={formData.shippingZip}
            onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
            error={errors.shippingZip}
            placeholder="97477"
          />

          <Input
            label="Customer Phone"
            value={formData.customerPhone || ''}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            placeholder="+1 555-0199"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save & Normalize Address
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
