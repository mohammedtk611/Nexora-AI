export interface AgentProgressStatus {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string | null;
}

export interface JobStatusResponse {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_stage: string;
  agents: AgentProgressStatus[];
  error_message?: string | null;
  metadata?: Record<string, any>;
}

export interface SSEJobEvent {
  event: string;
  data: Record<string, any>;
}
