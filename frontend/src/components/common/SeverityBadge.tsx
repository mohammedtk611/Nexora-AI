import React from 'react';
import { Badge } from '@/components/ui/badge';

export function SeverityBadge({ severity }: { severity: string }) {
  const normalized = (severity || '').toLowerCase();

  switch (normalized) {
    case 'critical':
      return <Badge variant="danger" className="font-bold border-red-500/80 bg-red-950/90 text-red-300">CRITICAL</Badge>;
    case 'high':
      return <Badge variant="warning" className="font-semibold border-amber-500/70 bg-amber-950/90 text-amber-300">HIGH</Badge>;
    case 'medium':
      return <Badge variant="warning">MEDIUM</Badge>;
    case 'low':
      return <Badge variant="info">LOW</Badge>;
    default:
      return <Badge variant="outline">{severity.toUpperCase()}</Badge>;
  }
}
