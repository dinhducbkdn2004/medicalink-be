export const PERMISSION_PATTERNS = {
  GET_ALL_PERMISSIONS: 'permissions.getAll',
  GET_USER_PERMISSION_SNAPSHOT: 'permissions.getUserPermissionSnapshot',
  GET_USER_PERMISSIONS: 'permissions.getUserPermissions',
  HAS_PERMISSION: 'permissions.hasPermission',
  ASSIGN_USER_PERMISSION: 'permissions.assignUserPermission',
  REVOKE_USER_PERMISSION: 'permissions.revokeUserPermission',
  GET_PERMISSION_STATS: 'permissions.getPermissionStats',
  INVALIDATE_USER_PERMISSION_CACHE: 'permissions.invalidateUserPermissionCache',
  REFRESH_USER_PERMISSION_SNAPSHOT: 'permissions.refreshUserPermissionSnapshot',
};

export const PERMISSION_GROUP_PATTERNS = {
  GET_ALL: 'permissions.getAllGroups',
  CREATE: 'permissions.createGroup',
  UPDATE: 'permissions.updateGroup',
  DELETE: 'permissions.deleteGroup',
  GET_USER_GROUPS: 'permissions.getUserGroups',
  ADD_USER_TO_GROUP: 'permissions.addUserToGroup',
  REMOVE_USER_FROM_GROUP: 'permissions.removeUserFromGroup',
  GET_GROUP_PERMISSIONS: 'permissions.getGroupPermissions',
  ASSIGN_GROUP_PERMISSION: 'permissions.assignGroupPermission',
  REVOKE_GROUP_PERMISSION: 'permissions.revokeGroupPermission',
};
