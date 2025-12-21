import { IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../common';

export class WorkLocationPublicQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: string = 'name';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['asc', 'desc'], {
    message: 'Sort order must be either asc or desc',
  })
  @Transform(({ value }) => value?.toString().toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'asc';
}
