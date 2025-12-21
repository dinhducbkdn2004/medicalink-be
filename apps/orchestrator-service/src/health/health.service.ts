import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@app/redis';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly redisService: RedisService) {}

  async check() {
    const checks = {
      service: 'orchestrator',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      dependencies: {
        redis: await this.checkRedis(),
      },
    };

    const isHealthy = Object.values(checks.dependencies).every(
      (dep) => dep.status === 'up',
    );

    return {
      ...checks,
      status: isHealthy ? 'healthy' : 'degraded',
    };
  }

  private async checkRedis() {
    try {
      const result = await this.redisService.ping();
      return {
        status: 'up',
        message: result,
      };
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'down',
        message: error.message,
      };
    }
  }
}
