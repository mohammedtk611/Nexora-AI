import React from 'react';
import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'completed':
    case 'generated':
    case 'passed':
      return <Badge variant="success">COMPLETED</Badge>;
    case 'running':
    case 'processing':
    case 'generating':
      return <Badge variant="info" className="animate-pulse">RUNNING</Badge>;
    case 'queued':
    case 'pending':
      return <Badge variant="warning">QUEUED</Badge>;
    case 'failed':
      return <Badge variant="danger">FAILED</Badge>;
    case 'cancelled':
      return <Badge variant="outline">CANCELLED</Badge>;
    default:
      return <Badge variant="outline">{status.toUpperCase()}</Badge>;
  }
}
