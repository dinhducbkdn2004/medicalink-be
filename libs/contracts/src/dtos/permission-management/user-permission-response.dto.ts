import { PermissionConditionDto } from './permission-condition.dto';

export interface UserPermissionResponseDto {
  id: string;
  userId: string;
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
