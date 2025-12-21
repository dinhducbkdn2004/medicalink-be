import { IsString, IsOptional } from 'class-validator';

export class RevokeGroupPermissionDto {
  @IsString()
  groupId: string;

  @IsString()
  permissionId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
