import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionRequirement {
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export const RequirePermission = (
  resource: string,
  action: string,
  context?: Record<string, any>,
) => SetMetadata(PERMISSIONS_KEY, [{ resource, action, context }]);

export const RequirePermissions = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Helper decorators for common permissions
export const RequireReadPermission = (
  resource: string,
  context?: Record<string, any>,
) => RequirePermission(resource, 'read', context);

export const RequireCreatePermission = (
  resource: string,
  context?: Record<string, any>,
) => RequirePermission(resource, 'create', context);

export const RequireUpdatePermission = (
  resource: string,
  context?: Record<string, any>,
) => RequirePermission(resource, 'update', context);

export const RequireDeletePermission = (
  resource: string,
  context?: Record<string, any>,
) => RequirePermission(resource, 'delete', context);

export const RequireManagePermission = (
  resource: string,
  context?: Record<string, any>,
) => RequirePermission(resource, 'manage', context);

// Administrative permissions
export const RequireSystemAdmin = () => RequirePermission('system', 'admin');

export const RequirePermissionManagement = () =>
  RequirePermission('permissions', 'manage');

export const RequireUserManagement = () => RequirePermission('staff', 'manage');
