import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateFaqDto {
  @IsString({ message: 'Question must be a string' })
  @IsNotEmpty({ message: 'Question is required' })
  @MaxLength(255, { message: 'Question must not exceed 255 characters' })
  question: string;

  @IsString({ message: 'Answer must be a string' })
  @IsNotEmpty({ message: 'Answer is required' })
  answer: string;

  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order must be at least 0' })
  @IsOptional()
  order?: number;

  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
