/**
 * Pagination metadata structure
 * Used across all services for consistent pagination response
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Cache metadata structure
 * Used for cache-aware responses
 */
export interface CacheMetadata {
  hit: boolean;
  ttl?: number;
  key?: string;
}
