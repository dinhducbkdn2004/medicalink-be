import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('IOREDIS') private readonly redis: Redis,
    @Inject('IOREDIS_PUB') private readonly redisPub: Redis,
    @Inject('IOREDIS_SUB') private readonly redisSub: Redis,
  ) {}

  // Cache operations
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.redis.setex(key, ttl, value);
    }
    return await this.redis.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds);
  }

  // JSON operations
  async setJson(key: string, value: any, ttl?: number): Promise<'OK'> {
    const jsonValue = JSON.stringify(value);
    return await this.set(key, jsonValue, ttl);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.redis.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  async hmset(key: string, hash: Record<string, string>): Promise<'OK'> {
    return await this.redis.hmset(key, hash);
  }

  async hmget(key: string, ...fields: string[]): Promise<(string | null)[]> {
    return await this.redis.hmget(key, ...fields);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return await this.redis.hdel(key, ...fields);
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    return await this.redisPub.publish(channel, message);
  }

  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    await this.redisSub.subscribe(channel);
    this.redisSub.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.redisSub.unsubscribe(channel);
  }

  // Rate limiting
  async isRateLimited(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, Math.ceil(windowMs / 1000));
    }
    return current > limit;
  }

  // Pattern-based operations
  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  async scan(
    cursor: string = '0',
    pattern?: string,
    count?: number,
  ): Promise<[string, string[]]> {
    if (pattern && count) {
      return await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', count);
    }
    if (pattern) {
      return await this.redis.scan(cursor, 'MATCH', pattern);
    }
    if (count) {
      return await this.redis.scan(cursor, 'COUNT', count);
    }
    return await this.redis.scan(cursor);
  }

  /**
   * Returns the configured key prefix of the underlying Redis client (if any).
   */
  getKeyPrefix(): string {
    const prefix = (this.redis.options as any)?.keyPrefix;
    return typeof prefix === 'string' ? prefix : '';
  }

  // Pipeline operations for better performance
  pipeline() {
    return this.redis.pipeline();
  }

  // Health check
  async ping(): Promise<string> {
    return await this.redis.ping();
  }

  // Disconnect
  disconnect(): void {
    this.redis.disconnect();
    this.redisPub.disconnect();
    this.redisSub.disconnect();
  }
}
