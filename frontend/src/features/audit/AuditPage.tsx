import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api/audit';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { History, Search, CheckCircle2, XCircle, Clock, User, Filter } from 'lucide-react';

interface AuditPageProps {
  onNavigate?: (route: string) => void;
}

export const AuditPage: React.FC<AuditPageProps> = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditApi.list(100, 0),
  });

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.resource && log.resource.toLowerCase().includes(search.toLowerCase())) ||
      (log.user_id && log.user_id.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <LoadingState label="Retrieving system audit log trail..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <History className="h-7 w-7 text-accent" />
            Activity & Enterprise Audit Log
          </h1>
          <p className="text-sm text-slate-400">
            Immutable operational event records tracking user actions, agent executions, ingestion jobs, and artifact exports.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface p-4 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search log by action, resource, or user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input appearance-none min-w-[200px]"
          >
            <option value="all">All Execution Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Audit Events Recorded"
          description="System events will be logged here as operators perform transformations and manage knowledge repositories."
        />
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg bg-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-primary text-xs font-mono uppercase text-slate-500 tracking-wider">
                <th className="py-4 px-6 font-semibold">Timestamp</th>
                <th className="py-4 px-6 font-semibold">Operator / User</th>
                <th className="py-4 px-6 font-semibold">Action Event</th>
                <th className="py-4 px-6 font-semibold">Resource Target</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-bg-primary/50 transition">
                  <td className="py-4 px-6 font-mono text-slate-400 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      {new Date(log.created_at || log.timestamp || Date.now()).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      {log.user_id || 'system'}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-slate-100">
                    {log.action}
                  </td>
                  <td className="py-4 px-6 font-mono text-accent">
                    {log.resource || '—'}
                  </td>
                  <td className="py-4 px-6">
                    {log.status === 'success' || log.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        SUCCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-danger bg-danger/10 border border-danger/20 px-2.5 py-1 rounded">
                        <XCircle className="h-3.5 w-3.5" />
                        FAILED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
