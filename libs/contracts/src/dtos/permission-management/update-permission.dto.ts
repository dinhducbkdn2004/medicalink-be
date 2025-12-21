import { IsString, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
