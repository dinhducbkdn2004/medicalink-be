import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class BlogQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'categorySlug must be a string' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'categorySlug must be a slug string',
  })
  categorySlug?: string;

  @IsOptional()
  @IsString({ message: 'categoryId must be a string' })
  categoryId?: string;

  @IsOptional()
  @IsString({ message: 'specialtyId must be a string' })
  specialtyId?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
    message: 'status must be one of DRAFT, PUBLISHED, ARCHIVED',
  })
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
