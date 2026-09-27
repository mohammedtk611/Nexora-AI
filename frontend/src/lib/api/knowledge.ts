import { apiFetch, API_MODE } from './client';
import { KnowledgeDocument, KnowledgeSearchResult } from '@/types/knowledge';
import { mockKnowledgeDocuments } from './mock/mockData';

export const knowledgeApi = {
  listDocuments: async (projectId?: string): Promise<KnowledgeDocument[]> => {
    if (API_MODE === 'mock') return mockKnowledgeDocuments;
    const query = projectId ? `?project_id=${projectId}` : '';
    try {
      return await apiFetch<KnowledgeDocument[]>(`/knowledge-base/documents${query}`);
    } catch {
      return mockKnowledgeDocuments;
    }
  },

  indexDocument: async (title: string, content: string, sourceType = 'text', projectId?: string): Promise<KnowledgeDocument> => {
    if (API_MODE === 'mock') {
      const doc: KnowledgeDocument = {
        id: 'kb_' + Date.now(),
        title,
        source_type: sourceType,
        chunk_count: 12,
        created_at: new Date().toISOString(),
      };
      mockKnowledgeDocuments.unshift(doc);
      return doc;
    }
    return apiFetch<KnowledgeDocument>('/knowledge-base/index', {
      method: 'POST',
      body: JSON.stringify({ title, content, source_type: sourceType, project_id: projectId }),
    });
  },

  search: async (query: string, topK = 5, projectId?: string): Promise<KnowledgeSearchResult[]> => {
    if (API_MODE === 'mock') {
      return [
        {
          score: 0.92,
          chunk_text: 'APT29 launched spear-phishing attack deploying Cobalt Strike payload to compromise domain controllers.',
          metadata: { title: 'APT29 Threat Report', project_id: projectId || 'proj_01' },
        },
        {
          score: 0.84,
          chunk_text: 'Remote code execution in SSL VPN gateway component allows unauthenticated shell access.',
          metadata: { title: 'SSL Gateway CVE Analysis', project_id: projectId || 'proj_01' },
        },
      ];
    }
    return apiFetch<KnowledgeSearchResult[]>('/knowledge-base/search', {
      method: 'POST',
      body: JSON.stringify({ query, top_k: topK, project_id: projectId }),
    });
  },

  deleteDocument: async (id: string): Promise<void> => {
    if (API_MODE === 'mock') return;
    return apiFetch(`/knowledge-base/${id}`, { method: 'DELETE' });
  },
};
