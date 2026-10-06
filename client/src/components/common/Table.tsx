import React, { TableHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table: React.FC<TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className={twMerge(clsx('w-full text-left text-sm text-slate-700', className))} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <thead className={clsx('bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200', className)}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <tbody className={clsx('divide-y divide-slate-100', className)}>{children}</tbody>;
};

export const TableRow: React.FC<{ children: ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'transition-colors duration-150 hover:bg-slate-50',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <th className={clsx('px-4 py-3.5 font-bold text-slate-700', className)}>{children}</th>;
};

export const TableCell: React.FC<{
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void;
}> = ({ children, className, onClick }) => {
  return (
    <td onClick={onClick} className={clsx('px-4 py-3.5 align-middle text-slate-800', className)}>
      {children}
    </td>
  );
};
