import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';
import { useUIStore } from '@/stores/uiStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

import InteractiveBackground from '@/components/common/InteractiveBackground';

interface AppShellProps {
  title: string;
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export function AppShell({ title, currentRoute, onNavigate, children }: AppShellProps) {
  const { notifications, removeNotification } = useUIStore();

  const isHome = currentRoute === '/' || currentRoute.toLowerCase() === '/dashboard';

  return (
    <div className="app-container relative">
      <Header currentRoute={currentRoute} onNavigate={onNavigate} />

      {/* Dynamic Line Ripple Interactive Background for all remaining pages leaving home */}
      {!isHome && (
        <div
          className="subpage-interactive-bg fixed inset-0 pointer-events-none"
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          <InteractiveBackground
            strokeColor="rgba(217, 168, 184, 0.28)"
            backgroundColor="transparent"
            count={52}
            movement={20}
            hover={true}
            force={3.5}
            resolution={4}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse 95% 80% at 50% 30%, transparent 20%, rgba(11, 11, 12, 0.55) 70%, rgba(11, 11, 12, 0.95) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      <main className={`main-content ${isHome ? 'main-content-home' : ''}`}>
        {children}
      </main>

      <Footer onNavigate={onNavigate} isHome={isHome} />

      {/* Global Command Palette */}
      <CommandPalette onNavigate={onNavigate} />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-lg border shadow-xl transition-all ${
              n.type === 'error'
                ? 'bg-red-950/95 border-red-800 text-red-200'
                : n.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-800 text-emerald-200'
                : n.type === 'warning'
                ? 'bg-amber-950/95 border-amber-800 text-amber-200'
                : 'bg-dark-900/95 border-dark-700 text-slate-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              {n.type === 'error' && <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />}
              {n.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />}
              {n.type === 'info' && <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />}
              <div>
                <h5 className="text-xs font-semibold">{n.title}</h5>
                {n.message && <p className="text-[11px] opacity-90 mt-0.5">{n.message}</p>}
              </div>
            </div>
            <button onClick={() => removeNotification(n.id)} className="opacity-70 hover:opacity-100 ml-2">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
