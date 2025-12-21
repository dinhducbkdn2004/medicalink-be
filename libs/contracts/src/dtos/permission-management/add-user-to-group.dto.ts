import { IsString, IsOptional } from 'class-validator';

export class AddUserToGroupDto {
  @IsString()
  userId: string;

  @IsString()
  groupId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
