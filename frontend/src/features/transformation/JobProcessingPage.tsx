import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api/jobs';
import { useUIStore } from '@/stores/uiStore';
import { SSEJobEvent } from '@/types/job';
import { Activity, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface JobProcessingPageProps {
  jobId: string;
  onNavigate?: (route: string) => void;
}

export function JobProcessingPage({ jobId, onNavigate }: JobProcessingPageProps) {
  const navigate = onNavigate || ((route: string) => {
    window.history.pushState({}, '', route);
    window.dispatchEvent(new Event('popstate'));
  });
  const { setActiveJobId, addNotification } = useUIStore();
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Poll job status
  const { data: jobStatus, refetch } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.get(jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed' || data?.status === 'cancelled') {
        return false;
      }
      return 2000;
    },
  });

  useEffect(() => {
    setActiveJobId(jobId);

    // Subscribe to backend Server-Sent Events (SSE)
    const unsubscribe = jobsApi.subscribeEvents(
      jobId,
      (evt: SSEJobEvent) => {
        const logLine = `[${new Date().toLocaleTimeString()}] Event: ${evt.event}`;
        setEventLogs((prev) => [logLine, ...prev.slice(0, 20)]);
        refetch();

        if (evt.event === 'job.completed') {
          setActiveJobId(null);
          addNotification({ type: 'success', title: 'Transformation Complete', message: 'All communication artifacts generated' });
          navigate(`/transform/${jobId}`);
        }
      },
      () => {
        setIsReconnecting(true);
        setTimeout(() => setIsReconnecting(false), 3000);
      }
    );

    return () => {
      unsubscribe();
      setActiveJobId(null);
    };
  }, [jobId, setActiveJobId, refetch, navigate, addNotification]);

  if (!jobStatus) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Activity className="w-8 h-8 text-accent animate-spin mb-4" />
        <p className="text-slate-400">Restoring Job Session...</p>
      </div>
    );
  }

  const isFinished = jobStatus.status === 'completed';

  const pipelineStages = [
    { id: 'ingestion', label: 'Ingestion' },
    { id: 'content_analysis', label: 'Content Analysis' },
    { id: 'knowledge_retrieval', label: 'Knowledge Retrieval' },
    { id: 'ai_agents', label: 'AI Agents' },
    { id: 'validation', label: 'Validation' },
    { id: 'artifact_generation', label: 'Artifact Generation' }
  ];

  const currentStageIndex = pipelineStages.findIndex(s => s.id === jobStatus.current_stage) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Processing Transformation</h1>
          <p className="text-slate-400 text-sm font-mono">JOB ID: {jobId}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full border border-border bg-surface">
            {jobStatus.status}
          </div>
          {isFinished && (
            <button className="btn btn-primary" onClick={() => navigate(`/transform/${jobId}`)}>
              View Results <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isReconnecting && (
        <div className="p-3 bg-surface border border-warning text-warning text-xs rounded flex items-center">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Reconnecting to backend stream...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Pipeline Visual */}
        <div>
          <h3 className="section-label mb-6">Execution Pipeline</h3>
          <div className="pipeline-container">
            {pipelineStages.map((stage, idx) => {
              const isActive = idx === currentStageIndex && !isFinished;
              const isCompleted = idx < currentStageIndex || isFinished;
              
              return (
                <div key={stage.id} className={`pipeline-stage ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className="stage-content">
                    <h4 className="stage-title">{stage.label}</h4>
                    {isActive && (
                      <div className="flex items-center text-xs text-accent mt-1">
                        <Activity className="w-3 h-3 mr-1 animate-pulse" /> Processing...
                      </div>
                    )}
                    {isCompleted && (
                      <div className="flex items-center text-xs text-success mt-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agents & Logs */}
        <div className="space-y-8">
          <div>
            <h3 className="section-label mb-4">Active Agents</h3>
            <div className="flex flex-col gap-3">
              {jobStatus.agents.length > 0 ? (
                jobStatus.agents.map((agent) => (
                  <div key={agent.name} className="p-3 border border-border bg-surface rounded-lg flex items-center justify-between">
                    <span className="text-sm font-semibold capitalize">{agent.name.replace('_', ' ')}</span>
                    <span className={`text-xs uppercase font-mono px-2 py-1 rounded ${
                      agent.status === 'completed' ? 'bg-success/20 text-success' :
                      agent.status === 'failed' ? 'bg-danger/20 text-danger' :
                      'bg-accent/20 text-accent animate-pulse'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 border border-border rounded-lg bg-surface text-center text-sm text-slate-400">
                  Initializing agents...
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="section-label mb-4">System Log</h3>
            <div className="p-4 border border-border bg-bg-secondary rounded-lg font-mono text-xs text-slate-400 h-48 overflow-y-auto">
              {eventLogs.length > 0 ? (
                eventLogs.map((log, idx) => (
                  <div key={idx} className="mb-1 pb-1 border-b border-border/50 last:border-0 opacity-80">{log}</div>
                ))
              ) : (
                <div>Subscribed to real-time events...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
