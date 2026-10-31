import React from 'react';
import { AlertCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from './Button.js';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  variant?: 'banner' | 'card';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  isRetrying = false,
  variant = 'banner',
  className = '',
}) => {
  if (variant === 'banner') {
    return (
      <div
        className={`p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm ${className}`}
        role="alert"
      >
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            {title && <span className="font-bold mr-1">{title}:</span>}
            <span>{message}</span>
          </div>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            disabled={isRetrying}
            onClick={onRetry}
            className="self-end sm:self-auto border-amber-300 text-amber-800 hover:bg-amber-100 font-bold h-7 px-2.5 text-xs shrink-0"
          >
            <RotateCcw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-red-200 p-12 text-center space-y-3 shadow-sm ${className}`}
      role="alert"
    >
      <div className="flex justify-center text-red-400">
        <AlertTriangle className="w-12 h-12 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title || 'Unable to Load Products'}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            disabled={isRetrying}
            onClick={onRetry}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      )}
    </div>
  );
};
