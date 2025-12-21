import { PermissionConditionDto } from './permission-condition.dto';

export interface GroupPermissionResponseDto {
  id: string;
  groupId: string;
  permissionId: string;
  tenantId: string;
  effect: 'ALLOW' | 'DENY';
  conditions?: PermissionConditionDto[];
  permission: {
    resource: string;
    action: string;
    description?: string;
  };
  createdAt: Date;
}
