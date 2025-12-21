import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionConditionDto } from './permission-condition.dto';

export class AssignGroupPermissionDto {
  @IsString()
  groupId: string;

  @IsString()
  permissionId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsEnum(['ALLOW', 'DENY'])
  effect?: 'ALLOW' | 'DENY';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionConditionDto)
  conditions?: PermissionConditionDto[];
}
