import { Injectable } from '@nestjs/common';
import { PermissionRepository } from './permission.repository';
import {
  PermissionStats,
  UserPermissionDetails,
  UserPermissionSnapshot,
} from './interfaces';
import {
  AddUserToGroupDto,
  AssignGroupPermissionDto,
  AssignUserPermissionDto,
  CreatePermissionGroupDto,
  RemoveUserFromGroupDto,
  RevokeGroupPermissionDto,
  RevokeUserPermissionDto,
} from '@app/contracts';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  // Permission Management
  async getAllPermissions(): Promise<
    Array<{
      id: string;
      resource: string;
      action: string;
      description?: string;
    }>
  > {
    return this.permissionRepository.getAllPermissions();
  }

  async getUserPermissionSnapshot(
    userId: string,
    tenantId: string = 'global',
  ): Promise<UserPermissionSnapshot> {
    return this.permissionRepository.getUserPermissionSnapshot(
      userId,
      tenantId,
    );
  }

  async getUserPermissionDetails(
    userId: string,
    tenantId: string = 'global',
  ): Promise<UserPermissionDetails[]> {
    return this.permissionRepository.getUserPermissionDetails(userId, tenantId);
  }

  async hasPermission(
    userId: string,
    resource: string,
    action: string,
    tenantId: string = 'global',
    context?: Record<string, any>,
  ): Promise<boolean> {
    return this.permissionRepository.hasPermission(
      userId,
      resource,
      action,
      tenantId,
      context,
    );
  }

  // User Permission Management
  async assignUserPermission(dto: AssignUserPermissionDto): Promise<void> {
    await this.permissionRepository.assignUserPermission(
      dto.userId,
      dto.permissionId,
      dto.tenantId || 'global',
      dto.effect || 'ALLOW',
      dto.conditions,
    );
  }

  async revokeUserPermission(dto: RevokeUserPermissionDto): Promise<void> {
    await this.permissionRepository.revokeUserPermission(
      dto.userId,
      dto.permissionId,
      dto.tenantId || 'global',
    );
  }

  // Group Management
  async getAllGroups(tenantId?: string): Promise<
    Array<{
      id: string;
      name: string;
      description?: string;
      tenantId?: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    return this.permissionRepository.getAllGroups(tenantId);
  }

  async createGroup(dto: CreatePermissionGroupDto): Promise<{
    id: string;
    name: string;
    description?: string;
    tenantId?: string;
  }> {
    return this.permissionRepository.createGroup(
      dto.name,
      dto.description,
      dto.tenantId,
    );
  }

  async updateGroup(
    id: string,
    name?: string,
    description?: string,
    isActive?: boolean,
    tenantId: string = 'global',
  ): Promise<void> {
    return this.permissionRepository.updateGroup(
      id,
      name,
      description,
      isActive,
      tenantId,
    );
  }

  async deleteGroup(groupId: string): Promise<void> {
    await this.permissionRepository.deleteGroup(groupId);
  }

  // User Group Management
  async getUserGroups(
    userId: string,
    tenantId?: string,
  ): Promise<
    Array<{
      id: string;
      groupId: string;
      groupName: string;
      groupDescription?: string;
      tenantId?: string;
      createdAt: Date;
    }>
  > {
    return this.permissionRepository.getUserGroups(userId, tenantId);
  }

  async addUserToGroup(dto: AddUserToGroupDto): Promise<void> {
    await this.permissionRepository.assignUserToGroup(
      dto.userId,
      dto.groupId,
      dto.tenantId || 'global',
    );
  }

  async removeUserFromGroup(dto: RemoveUserFromGroupDto): Promise<void> {
    await this.permissionRepository.removeUserFromGroup(
      dto.userId,
      dto.groupId,
      dto.tenantId || 'global',
    );
  }

  // Group Permission Management
  async getGroupPermissions(
    groupId: string,
    tenantId?: string,
  ): Promise<
    Array<{
      id: string;
      permissionId: string;
      resource: string;
      action: string;
      description?: string;
      effect: 'ALLOW' | 'DENY';
      conditions?: Array<{
        field: string;
        operator: 'eq' | 'ne' | 'in' | 'contains';
        value: any;
      }>;
      createdAt: Date;
    }>
  > {
    return this.permissionRepository.getGroupPermissions(groupId, tenantId);
  }

  async assignGroupPermission(dto: AssignGroupPermissionDto): Promise<void> {
    await this.permissionRepository.assignGroupPermission(
      dto.groupId,
      dto.permissionId,
      dto.tenantId || 'global',
      dto.effect || 'ALLOW',
      dto.conditions,
    );
  }

  async revokeGroupPermission(dto: RevokeGroupPermissionDto): Promise<void> {
    await this.permissionRepository.revokeGroupPermission(
      dto.groupId,
      dto.permissionId,
      dto.tenantId || 'global',
    );
  }

  // Permission Management Stats
  async getPermissionStats(): Promise<PermissionStats> {
    const [
      allPermissions,
      allGroups,
      totalUserPermissions,
      totalGroupPermissions,
      totalUserGroupMemberships,
      mostUsedPermissions,
      largestGroups,
    ] = await Promise.all([
      this.permissionRepository.getAllPermissions(),
      this.permissionRepository.getAllGroups(),
      this.permissionRepository.getTotalUserPermissions(),
      this.permissionRepository.getTotalGroupPermissions(),
      this.permissionRepository.getTotalUserGroupMemberships(),
      this.permissionRepository.getMostUsedPermissions(),
      this.permissionRepository.getLargestGroups(),
    ]);

    return {
      totalPermissions: allPermissions.length,
      totalGroups: allGroups.length,
      totalUserPermissions,
      totalGroupPermissions,
      totalUserGroupMemberships,
      mostUsedPermissions,
      largestGroups,
    };
  }

  // Cache Management
  async invalidateUserPermissionCache(userId: string): Promise<void> {
    // First, validate that the user exists
    await this.permissionRepository.validateUserExists(userId);

    // Increment auth version to invalidate cache
    await this.permissionRepository.incrementUserAuthVersion(userId);
  }

  async refreshUserPermissionSnapshot(
    userId: string,
    tenantId: string = 'global',
  ): Promise<UserPermissionSnapshot> {
    return this.permissionRepository.getUserPermissionSnapshot(
      userId,
      tenantId,
    );
  }
}
