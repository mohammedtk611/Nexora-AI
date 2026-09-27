import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { Search, PlusCircle, LayoutDashboard, Database, FileText, History, Settings, X } from 'lucide-react';

interface CommandPaletteProps {
  onNavigate: (route: string) => void;
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const commands = [
    { label: 'Start New Transformation', icon: PlusCircle, route: '/transform/new' },
    { label: 'Open Analyst Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { label: 'Search Knowledge Base', icon: Database, route: '/knowledge-base' },
    { label: 'Browse Artifacts Library', icon: FileText, route: '/artifacts' },
    { label: 'View System Audit Log', icon: History, route: '/activity' },
    { label: 'Open Platform Settings', icon: Settings, route: '/settings' },
  ];

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (route: string) => {
    setCommandPaletteOpen(false);
    setQuery('');
    onNavigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface border border-border rounded-lg shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="h-4 w-4 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            autoFocus
          />
          <button onClick={() => setCommandPaletteOpen(false)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(cmd.route)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors text-left"
                >
                  <Icon className="h-4 w-4 text-accent shrink-0" />
                  <span>{cmd.label}</span>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-slate-500">No matching commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
