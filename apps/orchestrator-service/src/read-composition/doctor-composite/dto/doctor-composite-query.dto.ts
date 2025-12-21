import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationDto } from '@app/contracts';

/**
 * Query DTO for fetching doctor composite data
 * Extends PaginationDto for consistent pagination across services
 */
export class DoctorCompositeQueryDto extends PaginationDto {
  // Filters - inherited from PaginationDto: page, limit, search, sortBy, sortOrder

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    // Convert comma-separated string to array
    return typeof value === 'string'
      ? value
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
      : value;
  })
  specialtyIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    // Convert comma-separated string to array
    return typeof value === 'string'
      ? value
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
      : value;
  })
  workLocationIds?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  // Cache control
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  skipCache?: boolean; // Force fresh data fetch
}
