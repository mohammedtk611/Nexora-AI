import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-dark-800 bg-dark-900/40 my-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dark-800 text-slate-400 mb-3 border border-dark-700/60">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
