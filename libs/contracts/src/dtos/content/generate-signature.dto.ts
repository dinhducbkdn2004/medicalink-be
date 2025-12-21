import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  Matches,
} from 'class-validator';

export class GenerateSignatureDto {
  @IsOptional()
  @IsString({ message: 'folder must be a string' })
  @MaxLength(100, { message: 'folder must be at most 100 characters' })
  @Matches(/^[a-zA-Z0-9_/-]*$/, {
    message:
      'folder can only contain alphanumeric characters, underscores, hyphens, and forward slashes',
  })
  folder?: string;

  @IsOptional()
  @IsString({ message: 'publicId must be a string' })
  @MaxLength(255, { message: 'publicId must be at most 255 characters' })
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message:
      'publicId can only contain alphanumeric characters, underscores, and hyphens',
  })
  publicId?: string;

  @IsOptional()
  @IsString({ message: 'transformation must be a string' })
  @MaxLength(500, { message: 'transformation must be at most 500 characters' })
  transformation?: string;

  @IsOptional()
  @IsEnum(['image', 'video', 'raw', 'auto'], {
    message: 'resourceType must be one of: image, video, raw, auto',
  })
  resourceType?: 'image' | 'video' | 'raw' | 'auto';

  @IsOptional()
  @IsString({ message: 'format must be a string' })
  @MaxLength(10, { message: 'format must be at most 10 characters' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'format can only contain alphanumeric characters',
  })
  format?: string;

  @IsOptional()
  @IsArray({ message: 'tags must be an array' })
  @IsString({ each: true, message: 'each tag must be a string' })
  @MaxLength(50, {
    each: true,
    message: 'each tag must be at most 50 characters',
  })
  tags?: string[];
}
