import { Controller, Get, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Controller('health')
export class RedisHealthController {
  constructor(@Inject('IOREDIS') private readonly redis: Redis) {}

  @Get('/redis')
  async checkRedisHealth(): Promise<{
    status: string;
    timestamp: string;
    evictionPolicy?: string;
    warning?: string;
  }> {
    try {
      const pong = await this.redis.ping();

      // Check eviction policy
      let evictionPolicy: string | undefined;
      let warning: string | undefined;

      try {
        const configResult = await this.redis.config('GET', 'maxmemory-policy');
        if (Array.isArray(configResult) && configResult.length >= 2) {
          evictionPolicy = configResult[1];

          // Warning if not using noeviction for microservices
          if (evictionPolicy !== 'noeviction') {
            warning = `Redis eviction policy is "${evictionPolicy}". For microservices with job queues, consider using "noeviction" to prevent data loss.`;
          }
        }
      } catch (_configError) {
        // Config command might be disabled, ignore
      }

      return {
        status: pong === 'PONG' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        ...(evictionPolicy && { evictionPolicy }),
        ...(warning && { warning }),
      };
    } catch (_error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
