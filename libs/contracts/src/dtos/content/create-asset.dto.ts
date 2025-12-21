import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  MaxLength,
  Matches,
} from 'class-validator';
import { AssetEntityType } from './asset-entity-type.enum';

export class CreateAssetDto {
  @IsEnum(AssetEntityType, {
    message: 'entityType must be one of: BLOG, QUESTION, REVIEW, DOCTOR',
  })
  entityType: AssetEntityType;

  @IsString({ message: 'entityId must be a string' })
  @MaxLength(27, { message: 'entityId must be at most 27 characters' })
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message:
      'entityId can only contain alphanumeric characters, underscores, and hyphens',
  })
  entityId: string;

  @IsString({ message: 'publicId must be a string' })
  @MaxLength(160, { message: 'publicId must be at most 160 characters' })
  publicId: string;

  @IsOptional()
  @IsObject({ message: 'metadata must be an object' })
  metadata?: Record<string, any>;
}
