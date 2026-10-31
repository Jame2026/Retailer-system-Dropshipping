import React from 'react';
import { Card } from '../../common/Card.js';
import { CheckCircle2 } from 'lucide-react';

export const BackgroundWorkersCard: React.FC = () => {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <CheckCircle2 className="w-5 h-5 text-teal-600" />
        <h3 className="text-sm font-bold text-slate-900">Background Workers Status</h3>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-700 font-medium">holdBuffer.worker (6h timer)</span>
          <span className="text-teal-700 font-bold">● Active (2m cycle)</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-700 font-medium">trackingSync.job (USPS/CJ)</span>
          <span className="text-teal-700 font-bold">● Active (15m cycle)</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-700 font-medium">retryBilling.job</span>
          <span className="text-teal-700 font-bold">● Active (1h cycle)</span>
        </div>
      </div>
    </Card>
  );
};
