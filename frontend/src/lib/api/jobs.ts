import { apiFetch, API_MODE } from './client';
import { JobStatusResponse, SSEJobEvent } from '@/types/job';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const jobsApi = {
  get: async (jobId: string): Promise<JobStatusResponse> => {
    if (API_MODE === 'mock') {
      return {
        job_id: jobId,
        status: 'completed',
        current_stage: 'completed',
        agents: [
          { name: 'ingestion_agent', status: 'completed' },
          { name: 'context_agent', status: 'completed' },
          { name: 'executive_agent', status: 'completed' },
          { name: 'advisory_agent', status: 'completed' },
          { name: 'compliance_agent', status: 'completed' },
        ],
      };
    }
    return apiFetch<JobStatusResponse>(`/jobs/${jobId}`);
  },

  cancel: async (jobId: string): Promise<void> => {
    if (API_MODE === 'mock') return;
    return apiFetch(`/jobs/${jobId}/cancel`, { method: 'POST' });
  },

  subscribeEvents: (jobId: string, onEvent: (evt: SSEJobEvent) => void, onError?: (err: any) => void): (() => void) => {
    if (API_MODE === 'mock') {
      const mockEvents: SSEJobEvent[] = [
        { event: 'job.started', data: { stage: 'ingestion' } },
        { event: 'context.completed', data: { stage: 'context' } },
        { event: 'job.completed', data: { stage: 'completed' } },
      ];
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < mockEvents.length) {
          onEvent(mockEvents[idx]);
          idx++;
        }
      }, 1500);
      return () => clearInterval(interval);
    }

    const sseUrl = `${API_BASE_URL}/api/v1/jobs/${jobId}/events`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent({ event: event.type || 'message', data });
      } catch (err) {
        console.error('Failed to parse SSE event payload', err);
      }
    };

    // Custom event listeners
    const eventTypes = [
      'job.started', 'ingestion.started', 'ingestion.completed',
      'context.started', 'context.completed', 'rag.started', 'rag.completed',
      'agent.started', 'agent.completed', 'agent.failed',
      'compliance.started', 'compliance.completed', 'artifact.started', 'artifact.completed',
      'job.completed', 'job.failed'
    ];

    eventTypes.forEach(evtName => {
      eventSource.addEventListener(evtName, (e: any) => {
        try {
          const data = JSON.parse(e.data);
          onEvent({ event: evtName, data });
        } catch {
          onEvent({ event: evtName, data: {} });
        }
      });
    });

    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => {
      eventSource.close();
    };
  },
};
