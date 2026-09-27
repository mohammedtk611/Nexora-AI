export interface KnowledgeDocument {
  id: string;
  project_id?: string | null;
  title: string;
  source_type: string;
  chunk_count: number;
  meta_info?: Record<string, any> | null;
  created_at: string;
}

export interface KnowledgeSearchRequest {
  query: string;
  project_id?: string;
  top_k?: number;
}

export interface KnowledgeSearchResult {
  score: number;
  chunk_text: string;
  metadata: Record<string, any>;
}
