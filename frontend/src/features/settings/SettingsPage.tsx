import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';
import { Settings as SettingsType } from '@/types/settings';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Settings, Cpu, Shield, Database, Server, Check, Sparkles } from 'lucide-react';

interface SettingsPageProps {
  onNavigate?: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'ollama'>('gemini');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: settings, isLoading, error } = useQuery<SettingsType>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  });

  useEffect(() => {
    if (settings?.llm_provider) {
      setSelectedProvider(settings.llm_provider as 'gemini' | 'ollama');
    }
  }, [settings?.llm_provider]);

  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleProviderSwitch = (provider: 'gemini' | 'ollama') => {
    setSelectedProvider(provider);
    updateMutation.mutate({ llm_provider: provider });
  };

  if (isLoading) return <LoadingState label="Retrieving system configuration..." />;
  if (error || !settings) return <EmptyState icon={Settings} title="Settings Error" description="Unable to connect to backend settings API endpoint." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Settings className="h-7 w-7 text-accent" />
            System & LLM Engine Settings
          </h1>
          <p className="text-sm text-slate-400">
            Manage GenAI model providers, vector indexing parameters, operational defaults, and system telemetry.
          </p>
        </div>
        {saveSuccess && (
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-success uppercase bg-success/10 border border-success/20 px-4 py-2 rounded-lg">
            <Check className="h-4 w-4" />
            Settings Updated
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: LLM Provider Configuration */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Model Provider */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <Cpu className="h-5 w-5 text-accent" />
                Specialized LLM Orchestration Engine
              </h2>
              <p className="text-sm text-slate-400">
                Select backend inference provider for agent transformation tasks. All direct API credentials remain secured strictly server-side.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provider 1: Gemini Cloud */}
              <div
                onClick={() => handleProviderSwitch('gemini')}
                className={`p-5 rounded-lg border cursor-pointer transition flex flex-col justify-between h-40 ${
                  selectedProvider === 'gemini'
                    ? 'bg-bg-primary border-accent shadow-md relative overflow-hidden'
                    : 'bg-bg-primary/50 border-border hover:border-slate-600'
                }`}
              >
                {selectedProvider === 'gemini' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                )}
                <div>
                  <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
                    Google Gemini 2.5 Flash
                    <Sparkles className="h-4 w-4 text-warning" />
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ultra-fast multi-modal processing with high structural reasoning.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-border/80">
                  <span className="text-slate-500 uppercase tracking-wider">Status</span>
                  <span className="px-2 py-0.5 rounded border border-success/30 text-success bg-success/10 text-[10px] font-bold tracking-wider">
                    AVAILABLE
                  </span>
                </div>
              </div>

              {/* Provider 2: Local Ollama */}
              <div
                onClick={() => handleProviderSwitch('ollama')}
                className={`p-5 rounded-lg border cursor-pointer transition flex flex-col justify-between h-40 ${
                  selectedProvider === 'ollama'
                    ? 'bg-bg-primary border-accent shadow-md relative overflow-hidden'
                    : 'bg-bg-primary/50 border-border hover:border-slate-600'
                }`}
              >
                {selectedProvider === 'ollama' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                )}
                <div>
                  <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
                    Local Ollama (Llama 3.1)
                    <Server className="h-4 w-4 text-slate-400" />
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Air-gapped on-premise model execution for ultra-sensitive intelligence.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-border/80">
                  <span className="text-slate-500 uppercase tracking-wider">Status</span>
                  <span className="px-2 py-0.5 rounded border border-slate-700 text-slate-400 bg-bg-primary text-[10px] font-bold tracking-wider">
                    CONFIGURED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Defaults */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-emerald-400" />
              Default Transformation Parameters
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Default Target Audience</label>
                <input
                  type="text"
                  disabled
                  value="Executive / Board"
                  className="input w-full opacity-70 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Default Communication Tone</label>
                <input
                  type="text"
                  disabled
                  value="Formal Threat Alert"
                  className="input w-full opacity-70 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Default Primary Language</label>
                <input
                  type="text"
                  disabled
                  value="English (en-US)"
                  className="input w-full opacity-70 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Server Topology & Security Audit */}
        <div className="space-y-8">
          {/* Vector Storage Status */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Database className="h-5 w-5 text-accent" />
              Qdrant Vector DB Topology
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between pb-3 border-b border-border font-mono">
                <span className="text-slate-500 uppercase">Vector Host</span>
                <span className="text-slate-200">{settings.qdrant_url}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-border font-mono">
                <span className="text-slate-500 uppercase">RAG Collection</span>
                <span className="text-accent">{settings.qdrant_collection}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 uppercase">Distance Metric</span>
                <span className="text-slate-200">Cosine (384-dim)</span>
              </div>
            </div>
          </div>

          {/* System Telemetry */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Server className="h-5 w-5 text-sky-400" />
              FastAPI Backend Health
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between pb-3 border-b border-border font-mono">
                <span className="text-slate-500 uppercase">Platform</span>
                <span className="text-slate-200">{settings.app_name}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-border font-mono">
                <span className="text-slate-500 uppercase">Environment</span>
                <span className="text-success uppercase tracking-wider font-bold">{settings.environment}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 uppercase">API Status</span>
                <span className="text-success font-bold tracking-wider">ONLINE (200 OK)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
