import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark-950 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-accent hover:bg-accent-light text-slate-950 font-semibold shadow-sm border border-accent/30',
      secondary: 'bg-surface hover:bg-surface-hover text-text-primary border border-border shadow-sm',
      outline: 'bg-transparent hover:bg-surface text-text-secondary hover:text-text-primary border border-border',
      ghost: 'bg-transparent hover:bg-surface text-text-secondary hover:text-text-primary',
      danger: 'bg-danger/15 hover:bg-danger/25 text-danger border border-danger/30',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
