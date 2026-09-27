export type ArtifactType = 
  | 'executive_brief'
  | 'advisory'
  | 'social'
  | 'presentation'
  | 'infographic'
  | 'video_script'
  | 'audio'
  | 'video'
  | 'srt';

export interface ArtifactValidation {
  status: 'passed' | 'warning' | 'failed';
  warnings?: string[];
  issues?: string[];
  checks?: Record<string, boolean>;
}

export interface Artifact {
  id: string;
  transformation_id: string;
  type: ArtifactType;
  title: string;
  status: 'pending' | 'generating' | 'generated' | 'failed' | 'regenerated';
  content?: Record<string, any> | null;
  file_path?: string | null;
  mime_type?: string | null;
  size: number;
  validation_status?: ArtifactValidation | null;
  validation?: { is_valid?: boolean; [key: string]: any } | null;
  created_at: string;
  updated_at: string;
}
