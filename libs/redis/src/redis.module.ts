import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Queue } from 'bullmq';
import { RedisService } from './redis.service';
import { QueueService } from './queue.service';
import { RedisHealthController } from './redis.health';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [RedisHealthController],
  providers: [
    {
      provide: 'IOREDIS',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host:
            configService.get<string>('REDIS_HOST', { infer: true }) ||
            'localhost',
          port:
            +configService.get<number>('REDIS_PORT', { infer: true }) || 6379,
          password: configService.get<string>('REDIS_PASSWORD', {
            infer: true,
          }),
          username: configService.get<string>('REDIS_USERNAME', {
            infer: true,
          }),
          db: +configService.get<number>('REDIS_DB', { infer: true }) || 0,
          tls: configService.get<boolean>('REDIS_TLS', { infer: true })
            ? {}
            : undefined,
          retryStrategy: (times) => Math.min(times * 200, 2000),
          maxRetriesPerRequest: 3,
          connectTimeout: 10000,
          lazyConnect: true,
          keyPrefix: `${
            configService.get<string>('SERVICE_NAME', { infer: true }) ||
            'medicalink'
          }:`,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'IOREDIS_PUB',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host:
            configService.get<string>('REDIS_HOST', { infer: true }) ||
            'localhost',
          port:
            +configService.get<number>('REDIS_PORT', { infer: true }) || 6379,
          password: configService.get<string>('REDIS_PASSWORD', {
            infer: true,
          }),
          username: configService.get<string>('REDIS_USERNAME', {
            infer: true,
          }),
          db: +configService.get<number>('REDIS_DB', { infer: true }) || 0,
          tls: configService.get<boolean>('REDIS_TLS', { infer: true })
            ? {}
            : undefined,
          retryStrategy: (times) => Math.min(times * 200, 2000),
          maxRetriesPerRequest: 3,
          connectTimeout: 10000,
          lazyConnect: true,
          keyPrefix: `${
            configService.get<string>('SERVICE_NAME', { infer: true }) ||
            'medicalink'
          }:pub:`,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'IOREDIS_SUB',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host:
            configService.get<string>('REDIS_HOST', { infer: true }) ||
            'localhost',
          port:
            +configService.get<number>('REDIS_PORT', { infer: true }) || 6379,
          password: configService.get<string>('REDIS_PASSWORD', {
            infer: true,
          }),
          username: configService.get<string>('REDIS_USERNAME', {
            infer: true,
          }),
          db: +configService.get<number>('REDIS_DB', { infer: true }) || 0,
          tls: configService.get<boolean>('REDIS_TLS', { infer: true })
            ? {}
            : undefined,
          retryStrategy: (times) => Math.min(times * 200, 2000),
          maxRetriesPerRequest: 3,
          connectTimeout: 10000,
          lazyConnect: true,
          keyPrefix: `${
            configService.get<string>('SERVICE_NAME', { infer: true }) ||
            'medicalink'
          }:sub:`,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'EMAIL_QUEUE',
      useFactory: (configService: ConfigService) => {
        return new Queue('email', {
          connection: {
            host:
              configService.get<string>('REDIS_HOST', { infer: true }) ||
              'localhost',
            port:
              +configService.get<number>('REDIS_PORT', { infer: true }) || 6379,
            password: configService.get<string>('REDIS_PASSWORD', {
              infer: true,
            }),
            username: configService.get<string>('REDIS_USERNAME', {
              infer: true,
            }),
            db: +configService.get<number>('REDIS_DB', { infer: true }) || 0,
            tls: configService.get<boolean>('REDIS_TLS', { infer: true })
              ? {}
              : undefined,
          },
          defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 50,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'NOTIFICATION_QUEUE',
      useFactory: (configService: ConfigService) => {
        return new Queue('notification', {
          connection: {
            host:
              configService.get<string>('REDIS_HOST', { infer: true }) ||
              'localhost',
            port:
              +configService.get<number>('REDIS_PORT', { infer: true }) || 6379,
            password: configService.get<string>('REDIS_PASSWORD', {
              infer: true,
            }),
            username: configService.get<string>('REDIS_USERNAME', {
              infer: true,
            }),
            db: +configService.get<number>('REDIS_DB', { infer: true }) || 0,
            tls: configService.get<boolean>('REDIS_TLS', { infer: true })
              ? {}
              : undefined,
          },
          defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 50,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        });
      },
      inject: [ConfigService],
    },
    RedisService,
    QueueService,
  ],
  exports: [
    'IOREDIS',
    'IOREDIS_PUB',
    'IOREDIS_SUB',
    'EMAIL_QUEUE',
    'NOTIFICATION_QUEUE',
    RedisService,
    QueueService,
  ],
})
export class RedisModule {}
