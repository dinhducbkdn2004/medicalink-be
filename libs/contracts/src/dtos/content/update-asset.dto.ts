import { IsString, IsOptional, IsObject, MaxLength } from 'class-validator';

export class UpdateAssetDto {
  @IsOptional()
  @IsString({ message: 'publicId must be a string' })
  @MaxLength(160, { message: 'publicId must be at most 160 characters' })
  publicId?: string;

  @IsOptional()
  @IsObject({ message: 'metadata must be an object' })
  metadata?: Record<string, any>;
}
