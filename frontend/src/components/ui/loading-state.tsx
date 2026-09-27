import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className, text = 'Loading data...' }: { className?: string; text?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 space-y-3', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
      <span className="text-xs text-slate-400 font-medium tracking-wide uppercase font-mono">{text}</span>
    </div>
  );
}

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return <LoadingSpinner text={label} />;
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded bg-dark-800/80', className)}
      {...props}
    />
  );
}
