import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-md border border-dark-800">
      <table className={cn('w-full caption-bottom text-xs text-slate-200', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-dark-900 border-b border-dark-800 text-slate-400 font-semibold uppercase tracking-wider', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0 divide-y divide-dark-800/60 bg-dark-950/60', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('hover:bg-dark-900/60 transition-colors data-[state=selected]:bg-dark-800', className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('h-9 px-4 text-left align-middle font-medium text-slate-400 uppercase text-[11px] tracking-wider', className)} {...props} />;
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />;
}
