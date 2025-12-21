import { PaginationMetadata, CacheMetadata } from '@app/contracts';
import { PaginatedCompositeResult } from '../../../common/types';
import { DoctorCompositeData } from './doctor-composite-result.dto';

/**
 * Result DTO for paginated doctor composite list
 */
export class DoctorCompositeListResultDto
  implements PaginatedCompositeResult<DoctorCompositeData>
{
  data: DoctorCompositeData[];

  meta: PaginationMetadata;

  cache?: CacheMetadata;

  timestamp: Date;
}
