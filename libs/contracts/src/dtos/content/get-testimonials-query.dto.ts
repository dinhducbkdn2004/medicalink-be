import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTestimonialsQueryDto {
  @IsString({ message: 'Search query must be a string' })
  @IsOptional()
  search?: string;

  @IsBoolean({ message: 'isFeatured must be a boolean' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;
}
