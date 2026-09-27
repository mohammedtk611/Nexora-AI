export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  resource: string;
  resource_id?: string | null;
  ip_address?: string | null;
  status: string;
  log_metadata?: Record<string, any> | null;
  timestamp: string;
  created_at?: string;
}
