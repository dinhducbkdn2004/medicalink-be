import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class GetBlogsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'categoryId must be a string' })
  categoryId?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
    message: 'status must be one of DRAFT, PUBLISHED, ARCHIVED',
  })
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @IsOptional()
  @IsBoolean({ message: 'minimal must be a boolean' })
  minimal?: boolean;
}
