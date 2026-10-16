import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api/jobs';
import { useUIStore } from '@/stores/uiStore';
import { SSEJobEvent } from '@/types/job';
import {
  Activity,
  ArrowRight,
  RefreshCw,
  Check,
  CheckCircle2,
  Sparkles,
  Bot,
  Terminal,
  Clock,
  Layers,
  ShieldCheck
} from 'lucide-react';

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
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll job status
  const { data: jobStatus, refetch } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.get(jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed' || data?.status === 'cancelled') {
        return false;
      }
      return 1500;
    },
  });

  useEffect(() => {
    setActiveJobId(jobId);

    // Subscribe to backend Server-Sent Events (SSE)
    const unsubscribe = jobsApi.subscribeEvents(
      jobId,
      (evt: SSEJobEvent) => {
        const logLine = `[${new Date().toLocaleTimeString()}] ${evt.event.replace('_', ' ').toUpperCase()}`;
        setEventLogs((prev) => [logLine, ...prev.slice(0, 30)]);
        refetch();

        if (evt.event === 'job.completed') {
          setActiveJobId(null);
          addNotification({
            type: 'success',
            title: 'Transformation Complete',
            message: 'All multi-agent communication artifacts generated successfully',
          });
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-pink-500/30 border-t-[#00ff87] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-5 h-5 text-pink-400 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-300 font-medium text-sm tracking-wide">Connecting to Intelligence Engine...</p>
        <p className="text-slate-500 text-xs font-mono">Job ID: {jobId}</p>
      </div>
    );
  }

  const isFinished = jobStatus.status === 'completed';

  // 6 Defined Pipeline Stages
  const pipelineStages = [
    {
      number: '01',
      id: 'ingestion',
      title: 'Ingestion',
      desc: 'Document normalization & OCR parsing',
    },
    {
      number: '02',
      id: 'context_agent',
      title: 'Context Analysis',
      desc: 'Intent Context Object (ICO) & entity extraction',
    },
    {
      number: '03',
      id: 'rag_retriever',
      title: 'Knowledge Retrieval',
      desc: 'Vector knowledge enrichment & grounded citations',
    },
    {
      number: '04',
      id: 'ai_agents',
      title: 'Multi-Agent Synthesis',
      desc: 'Executive Brief, Advisory, Social & Deck agents',
    },
    {
      number: '05',
      id: 'compliance',
      title: 'Policy & Guardrails',
      desc: 'MITRE ATT&CK framework & compliance validation',
    },
    {
      number: '06',
      id: 'artifact_generation',
      title: 'Artifact Generation',
      desc: 'Packaging PDF, PPTX, Infographic & Storyboards',
    },
  ];

  // Map backend stages accurately
  const getStageIndex = (stageName: string | undefined, finished: boolean): number => {
    if (finished) return 6;
    if (!stageName || stageName === 'queued') return 0;
    const s = stageName.toLowerCase();
    if (s.includes('ingestion')) return 0;
    if (s.includes('context')) return 1;
    if (s.includes('rag') || s.includes('retriev') || s.includes('knowledge')) return 2;
    if (
      s.includes('executive') ||
      s.includes('advisory') ||
      s.includes('social') ||
      s.includes('presentation') ||
      s.includes('infographic') ||
      s.includes('video') ||
      s.includes('agent')
    ) return 3;
    if (s.includes('compliance') || s.includes('validation')) return 4;
    if (s.includes('artifact') || s.includes('completed')) return 5;
    return 1;
  };

  const currentStageIndex = getStageIndex(jobStatus.current_stage, isFinished);

  // Dynamic progress calculation
  const progressPercent = isFinished
    ? 100
    : Math.min(95, Math.round(((currentStageIndex + 0.6) / pipelineStages.length) * 100));

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Green & Pink Ambient Glow Orbs */}
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff2d78]" />
              </span>
              <span className="text-xs uppercase font-mono tracking-widest text-[#ff2d78] font-bold">
                Live Transformation Stream
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Processing Transformation
            </h1>
            <p className="text-slate-400 text-xs font-mono mt-1 flex items-center gap-3">
              <span>JOB ID: <span className="text-slate-200">{jobId}</span></span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-pink-400" /> {formatTimer(secondsElapsed)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold font-mono border backdrop-blur-md ${
              isFinished
                ? 'bg-emerald-500/15 text-[#00ff87] border-[#00ff87]/40 shadow-[0_0_15px_rgba(0,255,135,0.25)]'
                : 'bg-pink-500/15 text-[#ff2d78] border-[#ff2d78]/40 shadow-[0_0_15px_rgba(255,45,120,0.25)] animate-pulse'
            }`}>
              {jobStatus.status}
            </div>

            {isFinished && (
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-[#00ff87] to-pink-400 hover:from-[#00ff87] hover:to-pink-300 shadow-[0_0_25px_rgba(0,255,135,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => navigate(`/transform/${jobId}`)}
              >
                <span>View Results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Track */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-400 font-medium">Pipeline Progression</span>
            <span className="font-bold text-[#00ff87]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-white/5 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out progress-bar-neon"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {isReconnecting && (
        <div className="p-3 bg-pink-950/40 border border-pink-500/40 text-pink-300 text-xs rounded-xl flex items-center backdrop-blur-md">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin text-pink-400" />
          Reconnecting to backend real-time event stream...
        </div>
      )}

      {/* Main Grid: Left Vertical Stepper (matching images) & Right Fleet/Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vertical Stepper (6 Columns) */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-white/10 rounded-2xl p-7 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#ff2d78]" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Transformation Pipeline
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              Stage {Math.min(6, currentStageIndex + 1)} of 6
            </span>
          </div>

          {/* Stepper Timeline matching user's exact uploaded designs */}
          <div className="stepper-timeline pl-2">
            {pipelineStages.map((stage, idx) => {
              const isActive = idx === currentStageIndex && !isFinished;
              const isCompleted = idx < currentStageIndex || isFinished;
              const isPending = idx > currentStageIndex && !isFinished;
              const isLast = idx === pipelineStages.length - 1;

              return (
                <div key={stage.id} className="stepper-item">
                  {/* Left Column: Node circle & Connecting track */}
                  <div className="stepper-line-container">
                    {/* The Node */}
                    <div
                      className={`stepper-node ${
                        isActive
                          ? 'active'
                          : isCompleted
                          ? 'completed'
                          : 'pending'
                      }`}
                    >
                      {isCompleted && (
                        <Check className="w-3 h-3 text-[#00ff87] stroke-[3]" />
                      )}
                    </div>

                    {/* Connecting Vertical Track */}
                    {!isLast && (
                      <div
                        className={`stepper-line ${
                          isCompleted
                            ? 'completed'
                            : isActive
                            ? 'active'
                            : ''
                        }`}
                      />
                    )}
                  </div>

                  {/* Right Details */}
                  <div className="stepper-details flex-1 pb-6">
                    {/* Number in Pink or Green */}
                    <div
                      className={`stepper-num ${
                        isActive
                          ? 'active'
                          : isCompleted
                          ? 'completed'
                          : 'pending'
                      }`}
                    >
                      {stage.number}
                    </div>

                    {/* Stage Title */}
                    <h4
                      className={`stepper-label ${
                        isActive
                          ? 'active'
                          : isCompleted
                          ? 'completed'
                          : 'pending'
                      }`}
                    >
                      {stage.title}
                    </h4>

                    {/* Description & Status */}
                    <p className="stepper-desc">{stage.desc}</p>

                    {isActive && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-pink-500/10 border border-[#ff2d78]/40 text-pink-300 shadow-[0_0_15px_rgba(255,45,120,0.15)] animate-pulse">
                        <Activity className="w-3.5 h-3.5 text-[#ff2d78]" />
                        <span>Synthesizing intelligence...</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Agent Fleet & System Terminal (6 Columns) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active AI Agent Fleet Card */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#00ff87]" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Autonomous Agent Fleet
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {jobStatus.agents?.filter(a => a.status === 'completed').length || 0} / {jobStatus.agents?.length || 8} Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {jobStatus.agents && jobStatus.agents.length > 0 ? (
                jobStatus.agents.map((agent) => {
                  const isAgentRunning = agent.status.startsWith('running');
                  const isAgentDone = agent.status === 'completed';

                  return (
                    <div
                      key={agent.name}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isAgentRunning
                          ? 'bg-pink-950/20 border-pink-500/40 shadow-[0_0_12px_rgba(255,45,120,0.15)]'
                          : isAgentDone
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-950/40 border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isAgentRunning
                              ? 'bg-[#ff2d78] animate-ping'
                              : isAgentDone
                              ? 'bg-[#00ff87]'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-xs font-medium text-slate-200 truncate capitalize">
                          {agent.name.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                          isAgentDone
                            ? 'bg-emerald-500/20 text-[#00ff87] border border-emerald-500/40'
                            : isAgentRunning
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-400">
                  <Activity className="w-5 h-5 mx-auto mb-2 text-pink-400 animate-pulse" />
                  Spawning multi-agent orchestrator...
                </div>
              )}
            </div>
          </div>

          {/* System Terminal Log Card */}
          <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-pink-400" />
                <h3 className="text-xs uppercase font-mono font-bold text-slate-300 tracking-wider">
                  Live Event Telemetry
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff87]" />
                <span className="text-[10px] font-mono text-emerald-400">STREAMING</span>
              </div>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-300 pr-2">
              {eventLogs.length > 0 ? (
                eventLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 py-0.5 border-b border-white/[0.03] last:border-0"
                  >
                    <span className="text-pink-400 select-none">›</span>
                    <span className={idx === 0 ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                      {log}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic py-4 text-center">
                  Listening for orchestrator events...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
