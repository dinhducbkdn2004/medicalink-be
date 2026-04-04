import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BadRequestError } from '@app/domain-errors';
import { PermissionService } from './permission.service';
import type { UpdateGroupPayload } from './interfaces';
import {
  AddUserToGroupDto,
  AssignGroupPermissionDto,
  AssignUserPermissionDto,
  CreatePermissionGroupDto,
  RemoveUserFromGroupDto,
  RevokeGroupPermissionDto,
  RevokeUserPermissionDto,
} from '@app/contracts';
import {
  PERMISSION_PATTERNS,
  PERMISSION_GROUP_PATTERNS,
} from '@app/contracts/patterns';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // Permission Management
  @MessagePattern(PERMISSION_PATTERNS.GET_ALL_PERMISSIONS)
  async getAllPermissions() {
    return this.permissionService.getAllPermissions();
  }

  @MessagePattern(PERMISSION_PATTERNS.GET_USER_PERMISSION_SNAPSHOT)
  async getUserPermissionSnapshot(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    const { userId, tenantId } = this.normalizeUserTenantPayload(payload);
    return this.permissionService.getUserPermissionSnapshot(userId, tenantId);
  }

  @MessagePattern(PERMISSION_PATTERNS.GET_USER_PERMISSIONS)
  async getUserPermissions(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    const { userId, tenantId } = this.normalizeUserTenantPayload(payload);
    return this.permissionService.getUserPermissionDetails(userId, tenantId);
  }

  @MessagePattern(PERMISSION_PATTERNS.HAS_PERMISSION)
  async hasPermission(
    @Payload()
    payload: {
      userId: string;
      resource: string;
      action: string;
      tenantId?: string;
      context?: Record<string, any>;
    },
  ) {
    const { userId, tenantId } = this.normalizeUserTenantPayload(payload);
    return this.permissionService.hasPermission(
      userId,
      payload.resource,
      payload.action,
      tenantId,
      payload.context,
    );
  }

  /** Coerce RPC payload so Prisma always receives string userId / tenantId. */
  private normalizeUserTenantPayload(payload: {
    userId?: unknown;
    tenantId?: unknown;
  }): { userId: string; tenantId: string } {
    const userId = this.coerceNonEmptyString(payload.userId, 'userId');
    const tenantId = this.coerceTenantId(payload.tenantId);
    return { userId, tenantId };
  }

  private coerceNonEmptyString(value: unknown, field: string): string {
    if (value === undefined || value === null) {
      throw new BadRequestError(`${field} is required`);
    }
    if (typeof value === 'string') {
      const s = value.trim();
      if (!s) {
        throw new BadRequestError(`${field} is required`);
      }
      return s;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === 'bigint') {
      return String(value);
    }
    throw new BadRequestError(`${field} must be a string or number`);
  }

  private coerceTenantId(value: unknown): string {
    if (value === undefined || value === null) {
      return 'global';
    }
    if (typeof value === 'string') {
      const raw = value.trim();
      return raw !== '' ? raw : 'global';
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === 'bigint') {
      return String(value);
    }
    throw new BadRequestError('tenantId must be a string or number');
  }

  // User Permission Management
  @MessagePattern(PERMISSION_PATTERNS.ASSIGN_USER_PERMISSION)
  async assignUserPermission(@Payload() dto: AssignUserPermissionDto) {
    return this.permissionService.assignUserPermission(dto);
  }

  @MessagePattern(PERMISSION_PATTERNS.REVOKE_USER_PERMISSION)
  async revokeUserPermission(@Payload() dto: RevokeUserPermissionDto) {
    return this.permissionService.revokeUserPermission(dto);
  }

  // Group Management
  @MessagePattern(PERMISSION_GROUP_PATTERNS.GET_ALL)
  async getAllGroups(@Payload() payload: { tenantId?: string }) {
    return this.permissionService.getAllGroups(payload.tenantId);
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.CREATE)
  async createGroup(@Payload() dto: CreatePermissionGroupDto) {
    return this.permissionService.createGroup(dto);
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.UPDATE)
  async updateGroup(@Payload() payload: UpdateGroupPayload) {
    return this.permissionService.updateGroup(
      payload.id,
      payload.name,
      payload.description,
      payload.isActive,
      payload.tenantId || 'global',
    );
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.DELETE)
  async deleteGroup(@Payload() payload: { groupId: string }) {
    return this.permissionService.deleteGroup(payload.groupId);
  }

  // User Group Management
  @MessagePattern(PERMISSION_GROUP_PATTERNS.GET_USER_GROUPS)
  async getUserGroups(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.getUserGroups(
      payload.userId,
      payload.tenantId,
    );
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.ADD_USER_TO_GROUP)
  async addUserToGroup(@Payload() dto: AddUserToGroupDto) {
    return this.permissionService.addUserToGroup(dto);
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.REMOVE_USER_FROM_GROUP)
  async removeUserFromGroup(@Payload() dto: RemoveUserFromGroupDto) {
    return this.permissionService.removeUserFromGroup(dto);
  }

  // Group Permission Management
  @MessagePattern(PERMISSION_GROUP_PATTERNS.GET_GROUP_PERMISSIONS)
  async getGroupPermissions(
    @Payload() payload: { groupId: string; tenantId?: string },
  ) {
    return this.permissionService.getGroupPermissions(
      payload.groupId,
      payload.tenantId,
    );
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.ASSIGN_GROUP_PERMISSION)
  async assignGroupPermission(@Payload() dto: AssignGroupPermissionDto) {
    return this.permissionService.assignGroupPermission(dto);
  }

  @MessagePattern(PERMISSION_GROUP_PATTERNS.REVOKE_GROUP_PERMISSION)
  async revokeGroupPermission(@Payload() dto: RevokeGroupPermissionDto) {
    return this.permissionService.revokeGroupPermission(dto);
  }

  // Permission Management Stats
  @MessagePattern(PERMISSION_PATTERNS.GET_PERMISSION_STATS)
  async getPermissionStats() {
    return this.permissionService.getPermissionStats();
  }

  // Cache Management
  @MessagePattern(PERMISSION_PATTERNS.INVALIDATE_USER_PERMISSION_CACHE)
  invalidateUserPermissionCache(@Payload() payload: { userId: string }) {
    return this.permissionService.invalidateUserPermissionCache(payload.userId);
  }

  @MessagePattern(PERMISSION_PATTERNS.REFRESH_USER_PERMISSION_SNAPSHOT)
  async refreshUserPermissionSnapshot(
    @Payload() payload: { userId: string; tenantId?: string },
  ) {
    return this.permissionService.refreshUserPermissionSnapshot(
      payload.userId,
      payload.tenantId || 'global',
    );
  }
}
