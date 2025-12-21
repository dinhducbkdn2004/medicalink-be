import { PaginatedResponse } from '../common';
import { WorkLocationResponseDto } from './work-location-response.dto';

export type WorkLocationPaginatedResponseDto =
  PaginatedResponse<WorkLocationResponseDto>;
