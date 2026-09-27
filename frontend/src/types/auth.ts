export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}
