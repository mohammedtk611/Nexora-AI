import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Bot, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';

interface AgentStatusCardProps {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string | null;
}

export function AgentStatusCard({ name, status, error }: AgentStatusCardProps) {
  const formatName = (str: string) => {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-accent" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Card className={`transition-all ${status === 'running' ? 'border-accent/50 bg-surface shadow-md' : ''}`}>
      <CardContent className="p-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-dark-800 text-slate-300 border border-dark-700/60">
            <Bot className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200 tracking-wide">{formatName(name)}</h4>
            {error && <p className="text-[11px] text-red-400 mt-0.5 line-clamp-1">{error}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getIcon()}
          <StatusBadge status={status} />
        </div>
      </CardContent>
    </Card>
  );
}
