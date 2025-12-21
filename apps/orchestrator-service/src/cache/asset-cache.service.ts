import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';
import { AssetEntityType } from '@app/contracts';

export interface AssetCacheKey {
  entityType: AssetEntityType;
  entityId: string;
  assetId?: string;
}

@Injectable()
export class AssetCacheService {
  private readonly logger = new Logger(AssetCacheService.name);
  private readonly assetCachePrefix = 'asset';
  private readonly entityAssetsCachePrefix = 'entity_assets';

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Invalidate cache for a specific asset
   */
  async invalidateAssetCache(assetId: string): Promise<void> {
    const cacheKey = `${this.assetCachePrefix}:${assetId}`;
    await this.cacheService.invalidate(cacheKey);
  }

  /**
   * Invalidate cache for all assets of a specific entity
   */
  async invalidateEntityAssetsCache(
    entityType: AssetEntityType,
    entityId: string,
  ): Promise<void> {
    const cacheKey = `${this.entityAssetsCachePrefix}:${entityType}:${entityId}`;
    await this.cacheService.invalidate(cacheKey);
  }

  /**
   * Invalidate all asset-related caches for an entity
   */
  async invalidateAllEntityAssetCaches(
    entityType: AssetEntityType,
    entityId: string,
  ): Promise<void> {
    // Invalidate entity assets cache
    await this.invalidateEntityAssetsCache(entityType, entityId);

    // Invalidate all asset caches that might be related to this entity
    const pattern = `${this.assetCachePrefix}:*:${entityType}:${entityId}`;
    await this.cacheService.invalidatePattern(pattern);
  }

  /**
   * Invalidate asset list caches by entity type
   */
  async invalidateAssetListCaches(entityType: AssetEntityType): Promise<void> {
    const pattern = `${this.entityAssetsCachePrefix}:${entityType}:*`;
    await this.cacheService.invalidatePattern(pattern);
  }

  /**
   * Invalidate multiple asset caches by their IDs
   */
  async invalidateMultipleAssetCaches(assetIds: string[]): Promise<void> {
    if (!assetIds || assetIds.length === 0) {
      return;
    }

    const invalidationPromises = assetIds.map((assetId) =>
      this.invalidateAssetCache(assetId),
    );

    await Promise.all(invalidationPromises);
  }

  /**
   * Invalidate asset caches by public IDs
   */
  async invalidateAssetCachesByPublicIds(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) {
      return;
    }

    // Since we're using public IDs, we need to invalidate by pattern
    const invalidationPromises = publicIds.map((publicId) => {
      const pattern = `${this.assetCachePrefix}:*:${publicId}`;
      return this.cacheService.invalidatePattern(pattern);
    });

    const results = await Promise.all(invalidationPromises);
    results.reduce((sum, count) => sum + count, 0);
  }

  /**
   * Invalidate all doctor-related asset caches
   */
  async invalidateDoctorAssetCaches(doctorProfileId: string): Promise<void> {
    await this.invalidateAllEntityAssetCaches(
      AssetEntityType.DOCTOR,
      doctorProfileId,
    );
  }

  /**
   * Comprehensive cache invalidation for doctor asset operations
   */
  async invalidateDoctorAssetCachesComprehensive(
    doctorProfileId: string,
    assetPublicIds?: string[],
  ): Promise<void> {
    // Invalidate doctor-specific asset caches
    await this.invalidateDoctorAssetCaches(doctorProfileId);

    // Invalidate specific asset caches if provided
    if (assetPublicIds && assetPublicIds.length > 0) {
      await this.invalidateAssetCachesByPublicIds(assetPublicIds);
    }

    // Invalidate doctor asset list caches
    await this.invalidateAssetListCaches(AssetEntityType.DOCTOR);
  }

  /**
   * Invalidate all specialty-related asset caches
   */
  async invalidateSpecialtyAssetCaches(specialtyId: string): Promise<void> {
    await this.invalidateAllEntityAssetCaches(
      AssetEntityType.SPECIALTY,
      specialtyId,
    );
  }

  /**
   * Comprehensive cache invalidation for specialty asset operations
   */
  async invalidateSpecialtyAssetCachesComprehensive(
    specialtyId: string,
    assetPublicIds?: string[],
  ): Promise<void> {
    // Invalidate specialty-specific asset caches
    await this.invalidateSpecialtyAssetCaches(specialtyId);

    // Invalidate specific asset caches if provided
    if (assetPublicIds && assetPublicIds.length > 0) {
      await this.invalidateAssetCachesByPublicIds(assetPublicIds);
    }

    // Invalidate specialty asset list caches
    await this.invalidateAssetListCaches(AssetEntityType.SPECIALTY);
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    await this.cacheService.invalidatePattern(pattern);
  }
}
