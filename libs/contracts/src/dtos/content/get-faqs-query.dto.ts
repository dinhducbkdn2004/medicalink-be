import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetFaqsQueryDto {
  @IsString({ message: 'Search query must be a string' })
  @IsOptional()
  search?: string;

  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
