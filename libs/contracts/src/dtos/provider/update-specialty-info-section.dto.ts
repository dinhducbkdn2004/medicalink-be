import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateSpecialtyInfoSectionDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(120, { message: 'Name must not exceed 120 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  content?: string;
}
