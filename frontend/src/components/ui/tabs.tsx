import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue || '');
  const currentValue = value !== undefined ? value : activeTab;

  const handleTabChange = (val: string) => {
    if (onValueChange) {
      onValueChange(val);
    } else {
      setActiveTab(val);
    }
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleTabChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('inline-flex h-9 items-center justify-start rounded-md bg-dark-900 p-1 text-slate-400 border border-dark-800', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-dark-800 text-white shadow-sm border border-dark-700/60' : 'hover:text-slate-200 hover:bg-dark-850',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return <div className={cn('mt-3 focus-visible:outline-none', className)}>{children}</div>;
}
