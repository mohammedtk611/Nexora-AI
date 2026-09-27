import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '@/lib/api/knowledge';
import { KnowledgeSearchResult } from '@/types/knowledge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Database, Search, Plus, Trash2, FileText, Layers, Sparkles } from 'lucide-react';

interface KnowledgeBasePageProps {
  onNavigate?: (route: string) => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ onNavigate }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'documents' | 'search'>('documents');

  // Indexing Form State
  const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docSourceType, setDocSourceType] = useState('text');
  const [docContent, setDocContent] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['knowledge-documents'],
    queryFn: () => knowledgeApi.listDocuments(),
  });

  const indexMutation = useMutation({
    mutationFn: (data: { title: string; content: string; sourceType: string }) =>
      knowledgeApi.indexDocument(data.title, data.content, data.sourceType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
      setIsIndexModalOpen(false);
      setDocTitle('');
      setDocContent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: knowledgeApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
    },
  });

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await knowledgeApi.search(searchQuery.trim(), 5);
      setSearchResults(results);
    } catch (err) {
      console.error('Semantic search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIndexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;
    indexMutation.mutate({
      title: docTitle.trim(),
      content: docContent.trim(),
      sourceType: docSourceType,
    });
  };

  if (isLoading) return <LoadingState label="Querying Qdrant Vector Knowledge Base..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Database className="h-7 w-7 text-accent" />
            Vector Knowledge Base
          </h1>
          <p className="text-sm text-slate-400">
            Qdrant-backed domain intelligence corpus used during AI transformation retrieval & grounding.
          </p>
        </div>
        <button onClick={() => setIsIndexModalOpen(true)} className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Index Document
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-surface text-accent border border-border'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          Indexed Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition flex items-center gap-2 ${
            activeTab === 'search'
              ? 'bg-surface text-accent border border-border'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="h-4 w-4" />
          Semantic Search Test
        </button>
      </div>

      {/* Tab 1: Indexed Documents List */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {documents.length === 0 ? (
            <EmptyState
              icon={Database}
              title="No Knowledge Documents Indexed"
              description="Upload or paste domain intelligence documents into Qdrant to improve AI transformation grounding."
              actionLabel="Index First Source"
              onAction={() => setIsIndexModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map(doc => (
                <div key={doc.id} className="bg-surface border border-border hover:border-slate-600 transition rounded-lg p-5 flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-semibold line-clamp-1 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-accent shrink-0" />
                        {doc.title}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded border border-accent/30 text-accent bg-accent/10 text-[10px] uppercase font-bold tracking-wider">
                      {doc.source_type}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-border">
                    <div className="text-xs text-slate-400 flex items-center justify-between font-mono mb-3">
                      <span>Chunks: <strong className="text-slate-200">{doc.chunk_count}</strong></span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm(`Delete document "${doc.title}" from knowledge index?`)) {
                            deleteMutation.mutate(doc.id);
                          }
                        }}
                        className="btn btn-secondary text-xs h-7 text-slate-400 hover:text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Vector Search Simulator */}
      {activeTab === 'search' && (
        <div className="space-y-8 max-w-4xl">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Query Vector Embeddings
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Execute dense semantic similarity queries against Qdrant collection embeddings to test RAG grounding accuracy.
            </p>
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Cobalt Strike lateral movement indicators or C2 infrastructure..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input flex-1"
              />
              <button type="submit" disabled={isSearching || !searchQuery.trim()} className="btn btn-primary">
                {isSearching ? 'Querying...' : 'Search Vectors'}
              </button>
            </form>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="section-label m-0">
                Similarity Search Results ({searchResults.length} matches)
              </h3>
              {searchResults.map((res, idx) => (
                <div key={idx} className="p-5 rounded-lg bg-surface border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">
                      {res.metadata?.title || 'Knowledge Chunk'}
                    </span>
                    <span className="px-2 py-1 rounded border border-accent/30 bg-accent/10 text-accent font-mono text-xs uppercase tracking-wider font-bold">
                      Match: {(res.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 bg-bg-primary p-4 rounded border border-border/60 leading-relaxed font-mono">
                    "{res.chunk_text}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Index Modal */}
      {isIndexModalOpen && (
        <div className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg max-w-xl w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Database className="h-5 w-5 text-accent" />
              Index Knowledge Source
            </h2>
            <form onSubmit={handleIndexSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIST SP 800-61 Rev 2 Incident Handling Guide"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  className="input w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Source Type</label>
                <select
                  value={docSourceType}
                  onChange={e => setDocSourceType(e.target.value)}
                  className="input w-full appearance-none"
                >
                  <option value="text">Raw Text / Article</option>
                  <option value="pdf">PDF Report</option>
                  <option value="advisory">Security Advisory</option>
                  <option value="policy">Policy Standard</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Content / Intelligence Text *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste domain intelligence context or standard operational guidelines..."
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  className="input w-full font-mono text-sm resize-none py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button type="button" onClick={() => setIsIndexModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={indexMutation.isPending} className="btn btn-primary">
                  {indexMutation.isPending ? 'Indexing...' : 'Index Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
