import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateBlogDoctorDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @IsOptional()
  content?: string;
}
