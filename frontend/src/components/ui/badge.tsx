import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'info' | 'success' | 'warning' | 'danger';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-surface text-text-secondary border-border',
    outline: 'bg-transparent text-text-secondary border-border',
    info: 'bg-accent/15 text-accent border-accent/30',
    success: 'bg-success/15 text-success border-success/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
    danger: 'bg-danger/15 text-danger border-danger/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
