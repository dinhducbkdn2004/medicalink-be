import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AssetResponseDto,
  CreateAssetDto,
  UpdateAssetDto,
  GetAssetsQueryDto,
  AssetsListResponseDto,
  AssetEntityType,
} from '@app/contracts';
import { ASSETS_PATTERNS } from '@app/contracts/patterns';
import { MicroserviceClientHelper } from './microservice-client.helper';

const TIMEOUTS = {
  SERVICE_CALL: 10000, // 10 seconds
};

@Injectable()
export class AssetsClientService {
  private readonly logger = new Logger(AssetsClientService.name);

  constructor(
    @Inject('CONTENT_SERVICE')
    private readonly contentClient: ClientProxy,
    private readonly clientHelper: MicroserviceClientHelper,
  ) {}

  /**
   * Create a new asset
   */
  async createAsset(createAssetDto: CreateAssetDto): Promise<AssetResponseDto> {
    try {
      const result = await this.clientHelper.send<AssetResponseDto>(
        this.contentClient,
        ASSETS_PATTERNS.CREATE,
        createAssetDto,
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if it's a conflict error (asset already exists)
      if (
        errorMessage.includes('already exists') ||
        errorMessage.includes('409')
      ) {
        this.logger.debug(
          `Asset ${createAssetDto.publicId} already exists for entity ${createAssetDto.entityType}:${createAssetDto.entityId} - skipping creation`,
        );
      } else {
        this.logger.error(
          `Failed to create asset ${createAssetDto.publicId}: ${errorMessage}`,
        );
      }

      throw error;
    }
  }

  /**
   * Get asset by ID
   */
  async getAssetById(id: string): Promise<AssetResponseDto> {
    this.logger.log(`Getting asset by id: ${id}`);

    try {
      const result = await this.clientHelper.send<AssetResponseDto>(
        this.contentClient,
        ASSETS_PATTERNS.GET_BY_ID,
        { id },
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get asset by id: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get asset by public ID
   */
  async getAssetByPublicId(publicId: string): Promise<AssetResponseDto> {
    this.logger.log(`Getting asset by publicId: ${publicId}`);

    try {
      const result = await this.clientHelper.send<AssetResponseDto>(
        this.contentClient,
        ASSETS_PATTERNS.GET_BY_PUBLIC_ID,
        { publicId },
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get asset by publicId: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get assets list with query
   */
  async getAssets(query: GetAssetsQueryDto): Promise<AssetsListResponseDto> {
    this.logger.log(`Getting assets list with query: ${JSON.stringify(query)}`);

    try {
      const result = await this.clientHelper.send<AssetsListResponseDto>(
        this.contentClient,
        ASSETS_PATTERNS.GET_LIST,
        query,
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get assets list: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get assets by entity
   */
  async getAssetsByEntity(
    entityType: AssetEntityType,
    entityId: string,
  ): Promise<AssetResponseDto[]> {
    this.logger.log(`Getting assets for entity ${entityType}:${entityId}`);

    try {
      const result = await this.clientHelper.send<AssetResponseDto[]>(
        this.contentClient,
        ASSETS_PATTERNS.GET_BY_ENTITY,
        {
          entityType,
          entityId,
        },
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get assets by entity: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Update asset
   */
  async updateAsset(
    id: string,
    updateAssetDto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    this.logger.log(`Updating asset: ${id}`);

    try {
      const result = await this.clientHelper.send<AssetResponseDto>(
        this.contentClient,
        ASSETS_PATTERNS.UPDATE,
        { id, updateAssetDto },
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      this.logger.log(`Asset updated successfully: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update asset: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Delete asset by ID
   */
  async deleteAsset(id: string): Promise<void> {
    this.logger.log(`Deleting asset: ${id}`);

    try {
      await this.clientHelper.send<void>(
        this.contentClient,
        ASSETS_PATTERNS.DELETE,
        { id },
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      this.logger.log(`Asset deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete asset: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Delete asset by public ID
   */
  async deleteAssetByPublicId(publicId: string): Promise<void> {
    this.logger.log(`Deleting asset by publicId: ${publicId}`);

    try {
      await this.clientHelper.send<void>(
        this.contentClient,
        ASSETS_PATTERNS.DELETE_BY_PUBLIC_ID,
        {
          publicId,
        },
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      this.logger.log(`Asset deleted successfully by publicId: ${publicId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete asset by publicId: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Delete assets by entity
   */
  async deleteAssetsByEntity(
    entityType: AssetEntityType,
    entityId: string,
  ): Promise<void> {
    this.logger.log(`Deleting assets for entity ${entityType}:${entityId}`);

    try {
      await this.clientHelper.send<void>(
        this.contentClient,
        ASSETS_PATTERNS.DELETE_BY_ENTITY,
        {
          entityType,
          entityId,
        },
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      this.logger.log(
        `Assets deleted successfully for entity ${entityType}:${entityId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete assets by entity: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Cleanup orphaned assets
   */
  async cleanupOrphanedAssets(publicIds: string[]): Promise<void> {
    try {
      await this.clientHelper.send<void>(
        this.contentClient,
        ASSETS_PATTERNS.CLEANUP_ORPHANED,
        { publicIds },
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );
    } catch (error) {
      this.logger.error(
        `Failed to cleanup orphaned assets: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Reconcile entity assets
   */
  async reconcileEntityAssets(
    prevPublicIds: string[],
    nextPublicIds: string[],
  ): Promise<void> {
    this.logger.log(`Reconciling entity assets`);

    try {
      await this.clientHelper.send<void>(
        this.contentClient,
        ASSETS_PATTERNS.RECONCILE_ENTITY,
        {
          prevPublicIds,
          nextPublicIds,
        },
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      this.logger.log(`Entity assets reconciled successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to reconcile entity assets: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Health check for assets service
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const result = await this.clientHelper.send<{
        status: string;
        timestamp: string;
      }>(
        this.contentClient,
        ASSETS_PATTERNS.HEALTH_CHECK,
        {},
        { timeoutMs: TIMEOUTS.SERVICE_CALL },
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Assets service health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
