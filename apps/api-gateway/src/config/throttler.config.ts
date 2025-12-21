import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { ThrottlerRedisStorage } from './throttler-redis.storage';

export const createThrottlerOptions = (
  redisStorage: ThrottlerRedisStorage,
  configService: ConfigService,
): ThrottlerModuleOptions => ({
  storage: redisStorage,
  throttlers: [
    {
      name: 'short',
      ttl:
        configService.get<number>('THROTTLER_SHORT_TTL', { infer: true }) ??
        1000, // Default: 1 second
      limit:
        configService.get<number>('THROTTLER_SHORT_LIMIT', { infer: true }) ??
        20, // Default: 20 requests
    },
    {
      name: 'long',
      ttl:
        configService.get<number>('THROTTLER_LONG_TTL', { infer: true }) ??
        60000, // Default: 1 minute
      limit:
        configService.get<number>('THROTTLER_LONG_LIMIT', { infer: true }) ??
        200, // Default: 200 requests
    },
  ],
});
