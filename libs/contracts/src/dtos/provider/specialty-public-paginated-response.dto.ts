import { PaginatedResponse } from '../common';
import { SpecialtyPublicResponseDto } from './specialty-public-response.dto';

export type SpecialtyPublicPaginatedResponseDto =
  PaginatedResponse<SpecialtyPublicResponseDto>;
