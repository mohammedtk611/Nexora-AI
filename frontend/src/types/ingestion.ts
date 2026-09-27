export interface NormalizedDocument {
  document_id: string;
  source_type: 'pdf' | 'docx' | 'txt' | 'image' | 'audio' | 'video' | 'url' | 'text';
  title: string;
  text: string;
  language?: string;
  metadata?: Record<string, any>;
  pages?: Array<{ page_number: number; text: string }>;
  media?: Array<{ type: string; path: string }>;
  entities?: string[];
  timestamps?: Array<{ start: number; end: number; text: string }>;
}

export interface IngestionResponse {
  ingestion_id: string;
  source_document_id: string;
  project_id: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  title: string;
  source_type: string;
  created_at: string;
}
