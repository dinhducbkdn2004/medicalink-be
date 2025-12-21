import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@app/redis';
import { createHash } from 'crypto';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Custom key prefix
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 300; // 5 minutes
  private readonly defaultPrefix = 'orchestrator';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Get cached value by key
   */
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const cached = await this.redisService.getJson<T>(fullKey);

      return cached;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.buildKey(key);
      const cacheTtl = ttl || this.defaultTTL;
      await this.redisService.setJson(fullKey, value, cacheTtl);
    } catch (error) {
      this.logger.error(`Failed to set cache for key ${key}:`, error);
    }
  }

  /**
   * Invalidate (delete) a specific key
   */
  async invalidate(key: string, prefix?: string): Promise<void> {
    try {
      const fullKey = this.buildKey(key, prefix);
      await this.redisService.del(fullKey);
      this.logger.debug(`Cache INVALIDATED: ${fullKey}`);
    } catch (error) {
      this.logger.error(
        `Cache invalidation error for key ${key}:`,
        error.message,
      );
    }
  }

  /**
   * Invalidate all keys matching a pattern
   */
  async invalidatePattern(pattern: string, prefix?: string): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern, prefix);
      const clientPrefix = this.redisService.getKeyPrefix();

      const directPattern = clientPrefix
        ? `${clientPrefix}${fullPattern}`
        : fullPattern;

      const directKeys = await this.redisService.keys(directPattern);

      if (directKeys.length > 0) {
        for (const key of directKeys) {
          const normalizedKey =
            clientPrefix && key.startsWith(clientPrefix)
              ? key.substring(clientPrefix.length)
              : key;
          await this.redisService.del(normalizedKey);
        }

        return directKeys.length;
      }

      return 0;
    } catch (error) {
      this.logger.error(
        `Cache pattern invalidation error for pattern ${pattern}:`,
        error.message,
      );
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const exists = await this.redisService.exists(fullKey);
      return exists > 0;
    } catch (error) {
      this.logger.error(
        `Cache exists check error for key ${key}:`,
        error.message,
      );
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[], prefix?: string): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map((key) => this.buildKey(key, prefix));
      const values = await Promise.all(
        fullKeys.map((key) => this.redisService.getJson<T>(key)),
      );
      return values;
    } catch (error) {
      this.logger.error(`Cache mget error:`, error.message);
      return keys.map(() => null);
    }
  }

  /**
   * Generate a hash-based cache key from object
   */
  generateHashKey(prefix: string, data?: any): string {
    if (!data) {
      return prefix;
    }
    const hash = createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16);
    return `${prefix}${hash}`;
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    const finalPrefix = prefix ?? this.defaultPrefix;
    return `${finalPrefix}:${key}`;
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key, options?.prefix);

    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options?.ttl);

    return value;
  }

  /**
   * Clear all cache keys for orchestrator
   */
  async clearAll(prefix?: string): Promise<number> {
    return this.invalidatePattern('*', prefix);
  }
}
