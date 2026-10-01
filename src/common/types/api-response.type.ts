export interface ApiResponse<T = any> {
  success: true;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[] | string[];
  requestId?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}
