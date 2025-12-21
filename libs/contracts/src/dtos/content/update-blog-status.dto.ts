import { IsIn } from 'class-validator';

export class UpdateBlogStatusDto {
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
    message: 'status must be one of DRAFT, PUBLISHED, ARCHIVED',
  })
  status!: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
