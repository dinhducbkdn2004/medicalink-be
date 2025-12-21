import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthVersionService {
  private readonly logger = new Logger(AuthVersionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current auth version for a user
   */
  async getUserAuthVersion(userId: string): Promise<number> {
    try {
      const authVersion = await this.prisma.authVersion.findUnique({
        where: {
          userId,
        },
      });

      return authVersion?.version || 1;
    } catch (error) {
      this.logger.error(
        `Error getting auth version for user ${userId}:`,
        error,
      );
      return 1; // Default version
    }
  }

  /**
   * Increment auth version for a user (invalidates cache)
   */
  async incrementUserAuthVersion(userId: string): Promise<number> {
    try {
      const result = await this.prisma.authVersion.upsert({
        where: {
          userId,
        },
        update: {
          version: {
            increment: 1,
          },
          updatedAt: new Date(),
        },
        create: {
          userId,
          version: 2, // Start at 2 (1 is default for new users)
        },
      });
      return result.version;
    } catch (error) {
      this.logger.error(
        `Error incrementing auth version for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Increment auth version for multiple users (bulk operation)
   */
  async incrementMultipleUsersAuthVersion(userIds: string[]): Promise<void> {
    try {
      // Use transaction for consistency
      await this.prisma.$transaction(async (tx) => {
        for (const userId of userIds) {
          await tx.authVersion.upsert({
            where: {
              userId,
            },
            update: {
              version: {
                increment: 1,
              },
              updatedAt: new Date(),
            },
            create: {
              userId,
              version: 2,
            },
          });
        }
      });
    } catch (error) {
      this.logger.error(
        `Error incrementing auth version for multiple users:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get auth versions for multiple users
   */
  async getMultipleUsersAuthVersion(
    userIds: string[],
  ): Promise<Record<string, number>> {
    try {
      const authVersions = await this.prisma.authVersion.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      });

      const versionMap: Record<string, number> = {};

      // Initialize all users with default version 1
      userIds.forEach((userId) => {
        versionMap[userId] = 1;
      });

      // Update with actual versions from database
      authVersions.forEach((av) => {
        versionMap[av.userId] = av.version;
      });

      return versionMap;
    } catch (error) {
      this.logger.error(
        `Error getting auth versions for multiple users:`,
        error,
      );
      // Return default versions for all users
      const defaultVersions: Record<string, number> = {};
      userIds.forEach((userId) => {
        defaultVersions[userId] = 1;
      });
      return defaultVersions;
    }
  }

  /**
   * Reset auth version for a user (force re-authentication)
   */
  async resetUserAuthVersion(userId: string): Promise<void> {
    try {
      await this.prisma.authVersion.upsert({
        where: {
          userId,
        },
        update: {
          version: 1,
          updatedAt: new Date(),
        },
        create: {
          userId,
          version: 1,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error resetting auth version for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Clean up old auth version entries (maintenance task)
   */
  async cleanupOldAuthVersions(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.authVersion.deleteMany({
        where: {
          updatedAt: {
            lt: cutoffDate,
          },
        },
      });
      return result.count;
    } catch (error) {
      this.logger.error(`Error cleaning up old auth versions:`, error);
      return 0;
    }
  }

  /**
   * Get auth version statistics
   */
  async getAuthVersionStats(): Promise<{
    totalUsers: number;
    avgVersion: number;
    maxVersion: number;
    usersWithHighVersions: number;
  }> {
    try {
      const stats = await this.prisma.authVersion.aggregate({
        _count: {
          userId: true,
        },
        _avg: {
          version: true,
        },
        _max: {
          version: true,
        },
      });

      const highVersionUsers = await this.prisma.authVersion.count({
        where: {
          version: {
            gt: 10, // Consider version > 10 as high
          },
        },
      });

      return {
        totalUsers: stats._count.userId || 0,
        avgVersion: Math.round(stats._avg.version || 1),
        maxVersion: stats._max.version || 1,
        usersWithHighVersions: highVersionUsers,
      };
    } catch (error) {
      this.logger.error(`Error getting auth version stats:`, error);
      return {
        totalUsers: 0,
        avgVersion: 1,
        maxVersion: 1,
        usersWithHighVersions: 0,
      };
    }
  }
}
