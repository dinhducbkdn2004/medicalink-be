import { PaginationMetadata, CacheMetadata } from '@app/contracts';

/**
 * Base interface for orchestration commands
 */
export interface OrchestratorCommand {
  /**
   * Idempotency key to prevent duplicate operations
   */
  idempotencyKey?: string;

  /**
   * User ID performing the action (for audit)
   */
  userId?: string;

  /**
   * Correlation ID for tracing across services
   */
  correlationId?: string;
}

/**
 * Base interface for orchestration results
 */
export interface OrchestratorResult<T = any> {
  /**
   * Success status
   */
  success: boolean;

  /**
   * Result data if successful
   */
  data?: T;

  /**
   * Error information if failed
   */
  error?: {
    message: string;
    code?: string;
    details?: any;
  };

  /**
   * Metadata about the operation
   */
  metadata?: {
    orchestrationId?: string;
    durationMs?: number;
    steps?: string[];
    [key: string]: any;
  };
}

/**
 * Base interface for composite data results
 */
export interface CompositeResult<T = any> {
  /**
   * Composite data
   */
  data: T;

  /**
   * Source information
   */
  sources: {
    service: string;
    fetched: boolean;
    error?: string;
  }[];

  /**
   * Cache information
   */
  cache?: CacheMetadata;

  /**
   * Timestamp
   */
  timestamp: Date;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated composite result
 */
export interface PaginatedCompositeResult<T = any> {
  data: T[];
  meta: PaginationMetadata;
  cache?: CacheMetadata;
  timestamp: Date;
}
