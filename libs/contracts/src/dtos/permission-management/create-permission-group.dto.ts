import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
