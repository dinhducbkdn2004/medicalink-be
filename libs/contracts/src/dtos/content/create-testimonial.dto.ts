import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class CreateTestimonialDto {
  @IsString({ message: 'Author name must be a string' })
  @IsNotEmpty({ message: 'Author name is required' })
  @MaxLength(120, { message: 'Author name must not exceed 120 characters' })
  authorName: string;

  @IsString({ message: 'Author avatar URL must be a string' })
  @IsUrl({}, { message: 'Author avatar must be a valid URL' })
  @IsOptional()
  authorAvatar?: string;

  @IsString({ message: 'Author title must be a string' })
  @MaxLength(120, { message: 'Author title must not exceed 120 characters' })
  @IsOptional()
  authorTitle?: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must not exceed 5' })
  @IsOptional()
  rating?: number;

  @IsBoolean({ message: 'isFeatured must be a boolean' })
  @IsOptional()
  isFeatured?: boolean;
}
