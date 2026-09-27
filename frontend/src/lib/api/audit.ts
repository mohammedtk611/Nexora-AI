import { apiFetch, API_MODE } from './client';
import { AuditLog } from '@/types/audit';
import { mockAuditLogs } from './mock/mockData';

export const auditApi = {
  list: async (limit = 50, skip = 0): Promise<AuditLog[]> => {
    if (API_MODE === 'mock') return mockAuditLogs;
    try {
      return await apiFetch<AuditLog[]>(`/audit?limit=${limit}&skip=${skip}`);
    } catch {
      return mockAuditLogs;
    }
  },
};
