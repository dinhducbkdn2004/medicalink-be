import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class UpdateWorkLocationDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(160, { message: 'Name must not exceed 160 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(255, { message: 'Address must not exceed 255 characters' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(32, { message: 'Phone must not exceed 32 characters' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Timezone must be a string' })
  @MaxLength(64, { message: 'Timezone must not exceed 64 characters' })
  timezone?: string;

  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'Google Map URL must be a string' })
  googleMapUrl?: string;
}
