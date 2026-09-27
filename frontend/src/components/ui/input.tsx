import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>}
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger focus:ring-danger focus:border-danger',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
