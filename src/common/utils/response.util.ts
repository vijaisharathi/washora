import { ApiResponse, PaginatedResponse, PaginationMeta } from '../types/api-response.type';

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponse<T> {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
  };

  return {
    success: true,
    data,
    meta,
  };
}
