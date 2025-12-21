import { SpecialtyInfoSectionResponseDto } from './specialty-info-section-response.dto';

export interface SpecialtyWithInfoSectionsResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  infoSections: SpecialtyInfoSectionResponseDto[];
}
