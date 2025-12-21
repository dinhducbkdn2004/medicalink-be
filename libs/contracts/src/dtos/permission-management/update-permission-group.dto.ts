import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePermissionGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
