export interface UpdateGroupPayload {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  tenantId?: string;
}

export interface UserPermissionSnapshot {
  userId: string;
  tenant: string;
  version: number;
  permissions: string[];
}

export interface UserPermissionDetails {
  resource: string;
  action: string;
  effect: 'ALLOW' | 'DENY';
  conditions?: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'in' | 'contains';
    value: any;
  }>;
}

export interface PermissionStats {
  totalPermissions: number;
  totalGroups: number;
  totalUserPermissions: number;
  totalGroupPermissions: number;
  totalUserGroupMemberships: number;
  mostUsedPermissions: Array<{
    permissionId: string;
    resource: string;
    action: string;
    usageCount: number;
  }>;
  largestGroups: Array<{
    groupId: string;
    groupName: string;
    memberCount: number;
  }>;
}
