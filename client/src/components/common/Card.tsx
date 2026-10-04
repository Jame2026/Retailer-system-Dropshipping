import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900',
          hoverEffect && 'transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
