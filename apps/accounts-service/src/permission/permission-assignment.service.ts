import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StaffRole } from '../../prisma/generated/client';

export interface PermissionAssignmentResult {
  success: boolean;
  userId: string;
  role: StaffRole;
  assignedGroupId?: string;
  assignedPermissions: string[];
  errors?: string[];
}

@Injectable()
export class PermissionAssignmentService {
  private readonly logger = new Logger(PermissionAssignmentService.name);
  private readonly DEFAULT_TENANT = 'global';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assigns default permissions to a newly created user based on their role
   * @param userId - The ID of the user
   * @param role - The role of the user
   * @returns Promise<PermissionAssignmentResult>
   */
  async assignPermissionsToNewUser(
    userId: string,
    role: StaffRole,
  ): Promise<PermissionAssignmentResult> {
    this.logger.log(`Assigning permissions to new user: ${userId} (${role})`);

    const result: PermissionAssignmentResult = {
      success: false,
      userId,
      role,
      assignedPermissions: [],
      errors: [],
    };

    try {
      // Execute all permission assignments in a transaction
      await this.prisma.$transaction(async (tx) => {
        // 1. Create/update auth version
        await this.createAuthVersion(tx, userId);

        // 2. Assign to role-based group (user will inherit all group permissions automatically)
        const groupId = await this.assignToRoleGroup(tx, userId, role);
        if (groupId) {
          result.assignedGroupId = groupId;
          result.assignedPermissions.push(
            `Assigned to group: ${role.toLowerCase()}`,
          );
        }
      });

      result.success = true;
      this.logger.log(
        `Permissions assigned successfully for user ${userId}: ${result.assignedPermissions.length} permissions`,
      );
    } catch (error) {
      result.success = false;
      result.errors = [error.message];
      this.logger.error(
        `Error assigning permissions to user ${userId}:`,
        error.stack,
      );
      throw error;
    }

    return result;
  }

  /**
   * Creates or updates auth version for cache invalidation
   */
  private async createAuthVersion(tx: any, userId: string): Promise<void> {
    await tx.authVersion.upsert({
      where: { userId },
      update: { version: 1 },
      create: {
        userId,
        version: 1,
      },
    });
  }

  /**
   * Assigns user to the appropriate role-based group
   */
  private async assignToRoleGroup(
    tx: any,
    userId: string,
    role: StaffRole,
  ): Promise<string | null> {
    const groupName = role.toLowerCase();
    const group = await tx.group.findFirst({
      where: {
        name: groupName,
        tenantId: this.DEFAULT_TENANT,
      },
    });

    if (!group) {
      this.logger.warn(`Group not found for role: ${role}`);
      return null;
    }

    await tx.userGroup.upsert({
      where: {
        userId_groupId_tenantId: {
          userId,
          groupId: group.id,
          tenantId: this.DEFAULT_TENANT,
        },
      },
      update: {},
      create: {
        userId,
        groupId: group.id,
        tenantId: this.DEFAULT_TENANT,
      },
    });

    this.logger.log(`Assigned user ${userId} to group ${groupName}`);
    return group.id;
  }

  async removeAllUserPermissions(userId: string): Promise<void> {
    this.logger.log(`Removing all permissions for user: ${userId}`);

    try {
      // Remove from groups
      await this.prisma.userGroup.deleteMany({
        where: { userId },
      });

      // Remove individual permissions
      await this.prisma.userPermission.deleteMany({
        where: { userId },
      });

      // Remove auth version
      await this.prisma.authVersion.delete({
        where: { userId },
      });

      this.logger.log(`All permissions removed for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error removing permissions for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async reassignPermissions(userId: string, newRole: StaffRole): Promise<void> {
    this.logger.log(
      `Reassigning permissions for user ${userId} to role ${newRole}`,
    );

    try {
      // Remove old permissions (except auth version - just increment it)
      await this.prisma.userGroup.deleteMany({
        where: { userId },
      });

      await this.prisma.userPermission.deleteMany({
        where: { userId },
      });

      // Increment auth version to invalidate cache
      await this.prisma.authVersion.upsert({
        where: { userId },
        update: { version: { increment: 1 } },
        create: { userId, version: 1 },
      });

      // Assign new permissions
      await this.assignPermissionsToNewUser(userId, newRole);

      this.logger.log(`Permissions reassigned successfully for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error reassigning permissions for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
