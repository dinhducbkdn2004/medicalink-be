import { Injectable, Inject } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';

export interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

@Injectable()
export class ThrottlerRedisStorage implements ThrottlerStorage {
  constructor(@Inject('IOREDIS') private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    _throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const blockKey = `${key}:blocked`;
    const ttlMilliseconds = ttl;
    const blockDurationMilliseconds = blockDuration || ttlMilliseconds;

    // Check if currently blocked
    const blockedUntil = await this.redis.get(blockKey);
    const now = Date.now();

    if (blockedUntil && parseInt(blockedUntil) > now) {
      const timeToBlockExpire = parseInt(blockedUntil) - now;
      return {
        totalHits: limit + 1,
        timeToExpire: ttlMilliseconds,
        isBlocked: true,
        timeToBlockExpire,
      };
    }

    // Remove block key if expired
    if (blockedUntil && parseInt(blockedUntil) <= now) {
      await this.redis.del(blockKey);
    }

    // Increment counter
    const multi = this.redis.multi();
    multi.incr(key);
    multi.pexpire(key, ttlMilliseconds);

    const results = await multi.exec();
    const totalHits = (results?.[0]?.[1] as number) || 0;

    // Get TTL for the key
    const keyTtl = await this.redis.pttl(key);
    const timeToExpire = keyTtl > 0 ? keyTtl : ttlMilliseconds;

    // Check if limit exceeded
    if (totalHits > limit) {
      // Set block
      const blockUntil = now + blockDurationMilliseconds;
      await this.redis.setex(
        blockKey,
        Math.ceil(blockDurationMilliseconds / 1000),
        blockUntil.toString(),
      );

      return {
        totalHits,
        timeToExpire,
        isBlocked: true,
        timeToBlockExpire: blockDurationMilliseconds,
      };
    }

    return {
      totalHits,
      timeToExpire,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }

  async reset(key: string): Promise<void> {
    const blockKey = `${key}:blocked`;
    await this.redis.del(key, blockKey);
  }
}
