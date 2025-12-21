import { PaginatedResponse } from '../common';
import { SpecialtyResponseDto } from './specialty-response.dto';

export type SpecialtyPaginatedResponseDto =
  PaginatedResponse<SpecialtyResponseDto>;
