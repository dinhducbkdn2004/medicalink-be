import { IsString, IsOptional } from 'class-validator';

export class RevokeUserPermissionDto {
  @IsString()
  userId: string;

  @IsString()
  permissionId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
