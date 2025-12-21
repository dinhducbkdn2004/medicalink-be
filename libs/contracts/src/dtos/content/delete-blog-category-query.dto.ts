import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteBlogCategoryQueryDto {
  @IsBoolean({ message: 'forceBulkDelete must be a boolean' })
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase() === 'true')
  forceBulkDelete?: boolean;
}
