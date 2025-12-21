import { PaginationMetadata } from './pagination-metadata.dto';

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: PaginationMetadata;
}
