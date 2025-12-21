import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../common';

export class SpecialtyQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @IsIn(['name', 'createdAt', 'updatedAt'], {
    message: 'Sort field must be one of: name, createdAt, updatedAt',
  })
  sortBy?: 'name' | 'createdAt' | 'updatedAt' = 'name';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['asc', 'desc'], {
    message: 'Sort order must be either asc or desc',
  })
  @Transform(({ value }) => value?.toString().toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsBoolean({ message: 'Active filter must be a boolean' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Include metadata must be a boolean' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeMetadata?: boolean;
}
