import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthVersionService } from './auth-version.service';
import { AUTH_VERSION_PATTERNS } from '@app/contracts/patterns';

@Controller()
export class AuthVersionController {
  constructor(private readonly authVersionService: AuthVersionService) {}

  @MessagePattern(AUTH_VERSION_PATTERNS.GET_USER_VERSION)
  async getUserAuthVersion(@Payload() payload: { userId: string }) {
    return this.authVersionService.getUserAuthVersion(payload.userId);
  }

  @MessagePattern(AUTH_VERSION_PATTERNS.INCREMENT_USER_VERSION)
  async incrementUserAuthVersion(@Payload() payload: { userId: string }) {
    return this.authVersionService.incrementUserAuthVersion(payload.userId);
  }

  @MessagePattern(AUTH_VERSION_PATTERNS.INCREMENT_MULTIPLE_USERS_VERSION)
  async incrementMultipleUsersAuthVersion(
    @Payload() payload: { userIds: string[] },
  ) {
    return this.authVersionService.incrementMultipleUsersAuthVersion(
      payload.userIds,
    );
  }

  @MessagePattern(AUTH_VERSION_PATTERNS.GET_MULTIPLE_USERS_VERSION)
  async getMultipleUsersAuthVersion(@Payload() payload: { userIds: string[] }) {
    return this.authVersionService.getMultipleUsersAuthVersion(payload.userIds);
  }

  @MessagePattern(AUTH_VERSION_PATTERNS.RESET_USER_VERSION)
  async resetUserAuthVersion(@Payload() payload: { userId: string }) {
    return this.authVersionService.resetUserAuthVersion(payload.userId);
  }

  @MessagePattern(AUTH_VERSION_PATTERNS.GET_AUTH_VERSION_STATS)
  async getAuthVersionStats() {
    return this.authVersionService.getAuthVersionStats();
  }

  @MessagePattern(AUTH_VERSION_PATTERNS.CLEANUP_OLD_AUTH_VERSIONS)
  async cleanupOldAuthVersions(@Payload() payload: { daysOld?: number } = {}) {
    return this.authVersionService.cleanupOldAuthVersions(
      payload.daysOld || 30,
    );
  }
}
