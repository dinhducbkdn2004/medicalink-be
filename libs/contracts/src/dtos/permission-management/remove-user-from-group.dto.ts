import { IsString, IsOptional } from 'class-validator';

export class RemoveUserFromGroupDto {
  @IsString()
  userId: string;

  @IsString()
  groupId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
