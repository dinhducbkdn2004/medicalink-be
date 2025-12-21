export interface SpecialtyResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  infoSectionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
