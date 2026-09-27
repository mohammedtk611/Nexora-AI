export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    request_id?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  limit: number;
}
