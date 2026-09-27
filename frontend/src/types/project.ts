export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
}
