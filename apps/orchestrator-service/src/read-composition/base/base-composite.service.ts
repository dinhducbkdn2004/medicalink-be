import { Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CacheService } from '../../cache/cache.service';
import { MicroserviceClientHelper } from '../../clients/microservice-client.helper';
import { CompositeResult, PaginatedCompositeResult } from '../../common/types';

/**
 * Configuration for fetching data from a service
 */
export interface ServiceFetchConfig<TPayload = any> {
  client: ClientProxy;
  pattern: string;
  payload: TPayload;
  timeoutMs?: number;
  serviceName: string;
}

/**
 * Options for composite operations
 */
export interface CompositeOptions {
  skipCache?: boolean;
  cacheTtl?: number;
  cachePrefix?: string;
}

/**
 * Abstract base class for composite services
 * Implements common patterns: cache check → parallel fetch → merge → cache
 */
export abstract class BaseCompositeService<TComposite, TQueryDto = any> {
  protected abstract readonly logger: Logger;
  protected abstract readonly cacheService: CacheService;
  protected abstract readonly clientHelper: MicroserviceClientHelper;
  protected abstract readonly cachePrefix: string;
  protected abstract readonly listCachePrefix: string;
  protected abstract readonly defaultCacheTtl: number;

  /**
   * Generic method to get composite data for a single entity
   */
  protected async getCompositeWithCache<TSource1, TSource2>(
    entityId: string,
    config: {
      source1: ServiceFetchConfig;
      source2: ServiceFetchConfig;
      cacheKey: string;
      cacheTtl?: number;
      skipCache?: boolean;
    },
    merger: (source1: TSource1, source2: TSource2) => TComposite,
  ): Promise<CompositeResult<TComposite>> {
    const startTime = Date.now();

    // Check cache first
    if (!config.skipCache) {
      const cached = await this.cacheService.get<TComposite>(config.cacheKey);
      if (cached) {
        return {
          data: cached,
          sources: [
            { service: config.source1.serviceName, fetched: false },
            { service: config.source2.serviceName, fetched: false },
          ],
          cache: {
            hit: true,
            ttl: config.cacheTtl || this.defaultCacheTtl,
            key: config.cacheKey,
          },
          timestamp: new Date(),
        };
      }
    }

    // Parallel fetch from both services
    const [result1, result2] = await Promise.allSettled([
      this.clientHelper.send<TSource1>(
        config.source1.client,
        config.source1.pattern,
        config.source1.payload,
        { timeoutMs: config.source1.timeoutMs || 8000 },
      ),
      this.clientHelper.send<TSource2>(
        config.source2.client,
        config.source2.pattern,
        config.source2.payload,
        { timeoutMs: config.source2.timeoutMs || 8000 },
      ),
    ]);

    // Process results
    const sources: CompositeResult<TComposite>['sources'] = [];
    let source1Data: TSource1 | null = null;
    let source2Data: TSource2 | null = null;

    if (result1.status === 'fulfilled') {
      source1Data = result1.value;
      sources.push({ service: config.source1.serviceName, fetched: true });
    } else {
      this.logger.error(
        `Failed to fetch from ${config.source1.serviceName}: ${result1.reason?.message}`,
      );
      sources.push({
        service: config.source1.serviceName,
        fetched: false,
        error: result1.reason?.message,
      });
    }

    if (result2.status === 'fulfilled') {
      source2Data = result2.value;
      sources.push({ service: config.source2.serviceName, fetched: true });
    } else {
      this.logger.error(
        `Failed to fetch from ${config.source2.serviceName}: ${result2.reason?.message}`,
      );
      sources.push({
        service: config.source2.serviceName,
        fetched: false,
        error: result2.reason?.message,
      });
    }

    // Both must succeed - if either fails, rethrow the original error
    if (!source1Data || !source2Data) {
      const failedError =
        result1.status === 'rejected'
          ? result1.reason
          : result2.status === 'rejected'
            ? result2.reason
            : new Error(`Entity ${entityId} not found or incomplete`);

      // If it's already RpcException, rethrow directly
      if (failedError instanceof RpcException) {
        throw failedError;
      }

      // If it has RPC error structure { error: {...}, message: '...' }, convert to RpcException
      if (
        typeof failedError === 'object' &&
        failedError !== null &&
        'error' in failedError
      ) {
        const errorObj = failedError as Record<string, any>;
        const errorPayload = errorObj.error || errorObj;
        throw new RpcException(errorPayload as object);
      }

      // Otherwise throw as is
      throw failedError;
    }

    // Merge data
    const compositeData = merger(source1Data, source2Data);

    // Cache the result
    const ttl = config.cacheTtl || this.defaultCacheTtl;
    await this.cacheService.set(config.cacheKey, compositeData, ttl);

    const durationMs = Date.now() - startTime;
    this.logger.log(
      `Composite fetched and cached in ${durationMs}ms for: ${entityId}`,
    );

    return {
      data: compositeData,
      sources,
      cache: {
        hit: false,
        ttl,
        key: config.cacheKey,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Generic method to search/list composite data with pagination
   */
  protected async searchCompositeWithCache<TPrimaryData, TSecondaryData>(
    query: TQueryDto,
    config: {
      primaryFetch: ServiceFetchConfig;
      secondaryFetch: (primaryData: TPrimaryData[]) => ServiceFetchConfig;
      cacheKey: string;
      cacheTtl?: number;
      skipCache?: boolean;
      extractIds: (primaryData: TPrimaryData[]) => string[];
      extractMeta: (primaryResult: any) => any;
    },
    merger: (
      primary: TPrimaryData,
      secondaries: TSecondaryData[],
    ) => TComposite | null,
  ): Promise<PaginatedCompositeResult<TComposite>> {
    const startTime = Date.now();

    // Check cache first
    if (!config.skipCache) {
      const cached = await this.cacheService.get<
        PaginatedCompositeResult<TComposite>
      >(config.cacheKey);
      if (cached) {
        return {
          ...cached,
          cache: {
            hit: true,
            ttl: config.cacheTtl || this.defaultCacheTtl,
            key: config.cacheKey,
          },
        };
      }
    }

    // Fetch primary data
    const primaryResult = await this.clientHelper.send<any>(
      config.primaryFetch.client,
      config.primaryFetch.pattern,
      config.primaryFetch.payload,
      { timeoutMs: config.primaryFetch.timeoutMs || 10000 },
    );

    const primaryData: TPrimaryData[] = primaryResult.data || [];

    // If no primary data found, return empty result
    if (primaryData.length === 0) {
      const emptyResult: PaginatedCompositeResult<TComposite> = {
        data: [],
        meta: config.extractMeta(primaryResult),
        cache: {
          hit: false,
          ttl: config.cacheTtl || this.defaultCacheTtl,
          key: config.cacheKey,
        },
        timestamp: new Date(),
      };

      await this.cacheService.set(
        config.cacheKey,
        emptyResult,
        config.cacheTtl || this.defaultCacheTtl,
      );
      return emptyResult;
    }

    // Fetch secondary data
    const secondaryFetchConfig = config.secondaryFetch(primaryData);
    const secondaryData = await this.clientHelper.send<TSecondaryData[]>(
      secondaryFetchConfig.client,
      secondaryFetchConfig.pattern,
      secondaryFetchConfig.payload,
      { timeoutMs: secondaryFetchConfig.timeoutMs || 12000 },
    );

    // Merge data
    const compositeData: TComposite[] = primaryData
      .map((primary) => merger(primary, secondaryData))
      .filter((item): item is TComposite => item !== null);

    const result: PaginatedCompositeResult<TComposite> = {
      data: compositeData,
      meta: config.extractMeta(primaryResult),
      cache: {
        hit: false,
        ttl: config.cacheTtl || this.defaultCacheTtl,
        key: config.cacheKey,
      },
      timestamp: new Date(),
    };

    // Cache the result
    await this.cacheService.set(
      config.cacheKey,
      result,
      config.cacheTtl || this.defaultCacheTtl,
    );

    const durationMs = Date.now() - startTime;
    this.logger.log(
      `Composite list fetched and cached in ${durationMs}ms (${compositeData.length} items)`,
    );

    return result;
  }

  /**
   * Invalidate cache for a specific entity
   */
  async invalidateEntityCache(entityId: string): Promise<void> {
    const cacheKey = `${this.cachePrefix}${entityId}`;
    await this.cacheService.invalidate(cacheKey);
  }

  /**
   * Invalidate all list caches
   */
  async invalidateListCache(): Promise<void> {
    await this.cacheService.invalidatePattern(`${this.listCachePrefix}*`);
  }

  /**
   * Build cache key for single entity
   */
  protected buildEntityCacheKey(entityId: string): string {
    return `${this.cachePrefix}${entityId}`;
  }

  /**
   * Build cache key for list query
   */
  protected buildListCacheKey(query: any): string {
    return this.cacheService.generateHashKey(this.listCachePrefix, query);
  }
}
