export interface PermissionManagementStatsDto {
  totalPermissions: number;
  totalGroups: number;
  totalUserPermissions: number;
  totalGroupPermissions: number;
  totalUserGroupMemberships: number;
  mostUsedPermissions: Array<{
    resource: string;
    action: string;
    usage: number;
  }>;
  largestGroups: Array<{
    id: string;
    name: string;
    memberCount: number;
  }>;
}
