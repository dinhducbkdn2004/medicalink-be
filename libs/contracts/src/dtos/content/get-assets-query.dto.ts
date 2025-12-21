import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetEntityType } from './asset-entity-type.enum';

export class GetAssetsQueryDto {
  @IsOptional()
  @IsEnum(AssetEntityType, {
    message: 'entityType must be one of: BLOG, QUESTION, REVIEW, DOCTOR',
  })
  entityType?: AssetEntityType;

  @IsOptional()
  @IsString({ message: 'entityId must be a string' })
  entityId?: string;

  @IsOptional()
  @IsString({ message: 'publicId must be a string' })
  publicId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit must be at most 100' })
  limit?: number = 10;
}
