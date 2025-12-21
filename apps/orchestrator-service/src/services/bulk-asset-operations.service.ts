import { Injectable, Logger } from '@nestjs/common';
import { AssetsClientService } from '../clients';
import { AssetCacheService } from '../cache/asset-cache.service';
import { AssetEntityType } from '@app/contracts';

@Injectable()
export class BulkAssetOperationsService {
  private readonly logger = new Logger(BulkAssetOperationsService.name);

  constructor(
    private readonly assetsClientService: AssetsClientService,
    private readonly assetCacheService: AssetCacheService,
  ) {}

  /**
   * Delete multiple assets by entity IDs
   */
  async deleteAssetsByEntities(
    entityIds: string[],
    entityType: AssetEntityType,
  ): Promise<void> {
    try {
      this.logger.log(
        `Deleting assets for ${entityIds.length} entities of type ${entityType}`,
      );

      for (const entityId of entityIds) {
        await this.assetsClientService.deleteAssetsByEntity(
          entityType,
          entityId,
        );
        await this.assetCacheService.invalidateEntityAssetsCache(
          entityType,
          entityId,
        );
      }

      this.logger.log(
        `Successfully deleted assets for ${entityIds.length} entities`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete assets for entities: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Invalidate cache for multiple entities
   */
  async invalidateCacheForEntities(
    entityIds: string[],
    entityType: AssetEntityType,
  ): Promise<void> {
    try {
      this.logger.log(
        `Invalidating cache for ${entityIds.length} entities of type ${entityType}`,
      );

      for (const entityId of entityIds) {
        await this.assetCacheService.invalidateEntityAssetsCache(
          entityType,
          entityId,
        );
      }

      this.logger.log(
        `Successfully invalidated cache for ${entityIds.length} entities`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for entities: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
