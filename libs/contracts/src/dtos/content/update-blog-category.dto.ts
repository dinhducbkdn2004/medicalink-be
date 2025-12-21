import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogCategoryDto } from './create-blog-category.dto';
import { IsOptional } from 'class-validator';
import { IsCuid } from '@app/contracts/decorators';

export class UpdateBlogCategoryDto extends PartialType(CreateBlogCategoryDto) {
  @IsCuid({ message: 'Category ID must be a valid CUID' })
  @IsOptional()
  id: string;
}
