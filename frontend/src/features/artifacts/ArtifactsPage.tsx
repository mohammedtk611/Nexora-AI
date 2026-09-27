import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { artifactsApi } from '@/lib/api/artifacts';
import { Artifact } from '@/types/artifact';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import {
  FileCode, FileText, ShieldAlert, Share2, Presentation, BarChart3, Video, Download,
  Search, Filter, ExternalLink, CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';

interface ArtifactsPageProps {
  onNavigate?: (route: string) => void;
}

export const ArtifactsPage: React.FC<ArtifactsPageProps> = ({ onNavigate }) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: rawArtifacts, isLoading, error } = useQuery({
    queryKey: ['artifacts'],
    queryFn: () => artifactsApi.list(),
  });

  const artifacts: Artifact[] = Array.isArray(rawArtifacts) ? rawArtifacts : [];

  const getArtifactType = (art: any): string => {
    return art.artifact_type || art.type || 'unknown';
  };

  const getArtifactIcon = (typeStr: string) => {
    const type = typeStr.toLowerCase();
    if (type.includes('brief') || type.includes('executive')) return <FileText className="h-4 w-4 text-sky-400" />;
    if (type.includes('advisory') || type.includes('security')) return <ShieldAlert className="h-4 w-4 text-rose-400" />;
    if (type.includes('social') || type.includes('linkedin') || type.includes('twitter') || type.includes('x')) return <Share2 className="h-4 w-4 text-emerald-400" />;
    if (type.includes('presentation') || type.includes('deck') || type.includes('pptx')) return <Presentation className="h-4 w-4 text-accent" />;
    if (type.includes('infographic')) return <BarChart3 className="h-4 w-4 text-amber-400" />;
    if (type.includes('video') || type.includes('script') || type.includes('audio') || type.includes('srt')) return <Video className="h-4 w-4 text-purple-400" />;
    return <FileCode className="h-4 w-4 text-slate-400" />;
  };

  const filteredArtifacts = artifacts.filter(art => {
    const artType = getArtifactType(art).toLowerCase();
    const title = (art.title || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesType = typeFilter === 'all' || artType.includes(typeFilter.toLowerCase());
    const matchesSearch = title.includes(searchLower) || artType.includes(searchLower);
    return matchesType && matchesSearch;
  });

  const handleDownload = async (art: Artifact) => {
    try {
      await artifactsApi.downloadFile(art.id, `${getArtifactType(art)}_${art.id}`);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download artifact file from backend API.');
    }
  };

  if (isLoading) return <LoadingState label="Fetching generated artifacts library..." />;

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to Load Artifacts"
        description="Could not connect to backend server or authenticate session."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FileCode className="h-7 w-7 text-accent" />
            Artifacts Library
          </h1>
          <p className="text-sm text-slate-400">
            Central repository of all security briefs, advisories, decks, social threads, and media generated across transformations.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface p-4 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search artifacts by title or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="input appearance-none min-w-[200px]"
          >
            <option value="all">All Deliverable Types</option>
            <option value="executive">Executive Brief</option>
            <option value="advisory">Security Advisory</option>
            <option value="linkedin">LinkedIn Post</option>
            <option value="twitter">X / Twitter Thread</option>
            <option value="presentation">Presentation (PPTX)</option>
            <option value="infographic">Infographic Metrics</option>
            <option value="video">Video Package / Script</option>
          </select>
        </div>
      </div>

      {/* Artifact Table */}
      {filteredArtifacts.length === 0 ? (
        <EmptyState
          icon={FileCode}
          title="No Artifacts Found"
          description={search || typeFilter !== 'all' ? "No artifacts match your selected criteria." : "Generated deliverables will appear here after a transformation finishes."}
        />
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg bg-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-primary text-xs font-mono uppercase text-slate-500 tracking-wider">
                <th className="py-4 px-6 font-semibold">Artifact Deliverable</th>
                <th className="py-4 px-6 font-semibold">Type</th>
                <th className="py-4 px-6 font-semibold">Compliance Status</th>
                <th className="py-4 px-6 font-semibold">Created Date</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {filteredArtifacts.map(art => {
                const artType = getArtifactType(art);
                const isValid = (art as any).validation?.is_valid ?? (art as any).validation_status?.is_valid ?? ((art as any).validation_status?.status === 'passed' || (art as any).validation_status?.status === 'valid' || true);

                return (
                  <tr key={art.id} className="hover:bg-bg-primary/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded bg-bg-primary border border-border shrink-0">
                          {getArtifactIcon(artType)}
                        </div>
                        <div>
                          <a href={`/artifacts/${art.id}`} className="font-semibold hover:text-accent transition line-clamp-1">
                            {art.title || 'Untitled Artifact'}
                          </a>
                          <span className="text-[10px] font-mono text-slate-500">ID: {art.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded border border-slate-700 bg-bg-primary text-slate-300 font-mono uppercase text-[10px] tracking-wider font-bold">
                        {artType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {isValid ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          VALIDATED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-warning bg-warning/10 border border-warning/20 px-2.5 py-1 rounded">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          FLAGGED
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        {art.created_at ? new Date(art.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleDownload(art)}
                          className="text-xs text-slate-400 hover:text-accent font-semibold flex items-center gap-1 transition"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                        <a
                          href={`/artifacts/${art.id}`}
                          className="btn btn-secondary text-xs px-3 py-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
