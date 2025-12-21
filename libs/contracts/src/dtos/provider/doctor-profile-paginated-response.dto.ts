import { PaginatedResponse } from '../common';
import { DoctorProfileResponseDto } from './doctor-profile-response.dto';

export type DoctorProfilePaginatedResponseDto =
  PaginatedResponse<DoctorProfileResponseDto>;
