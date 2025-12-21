import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { IsCuid } from '@app/contracts/decorators';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsCuid({ message: 'Blog ID must be a valid CUID' })
  @IsOptional()
  id?: string;

  @IsString({ message: 'Status must be a string' })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
    message: 'Status must be DRAFT, PUBLISHED, or ARCHIVED',
  })
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
