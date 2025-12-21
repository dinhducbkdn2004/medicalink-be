export interface PermissionGroupResponseDto {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  userCount?: number;
  permissionCount?: number;
}
