import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateSpecialtyInfoSectionDto {
  @IsString({ message: 'Specialty ID must be a string' })
  @IsNotEmpty({ message: 'Specialty ID is required' })
  specialtyId: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(120, { message: 'Name must not exceed 120 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  content?: string;
}
