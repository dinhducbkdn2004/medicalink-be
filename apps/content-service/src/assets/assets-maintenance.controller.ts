import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetResponseDto,
  GetAssetsQueryDto,
  AssetsListResponseDto,
  AssetEntityType,
} from '@app/contracts';
import { AssetsService } from './assets.service';
import { AssetsMaintenanceService } from './assets-maintenance.service';
import { ASSETS_PATTERNS } from '@app/contracts/patterns';

@Controller()
export class AssetsMaintenanceController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly assetsMaintenanceService: AssetsMaintenanceService,
  ) {}

  @MessagePattern(ASSETS_PATTERNS.CREATE)
  async createAsset(
    @Payload() createAssetDto: CreateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.assetsService.createAsset(createAssetDto);
  }

  @MessagePattern(ASSETS_PATTERNS.GET_BY_ID)
  async getAssetById(
    @Payload() payload: { id: string },
  ): Promise<AssetResponseDto> {
    return this.assetsService.getAssetById(payload.id);
  }

  @MessagePattern(ASSETS_PATTERNS.GET_BY_PUBLIC_ID)
  async getAssetByPublicId(
    @Payload() payload: { publicId: string },
  ): Promise<AssetResponseDto> {
    return this.assetsService.getAssetByPublicId(payload.publicId);
  }

  @MessagePattern(ASSETS_PATTERNS.GET_LIST)
  async getAssets(
    @Payload() query: GetAssetsQueryDto,
  ): Promise<AssetsListResponseDto> {
    return this.assetsService.getAssets(query);
  }

  @MessagePattern(ASSETS_PATTERNS.GET_BY_ENTITY)
  async getAssetsByEntity(
    @Payload() payload: { entityType: AssetEntityType; entityId: string },
  ): Promise<AssetResponseDto[]> {
    return this.assetsService.getAssetsByEntity(
      payload.entityType,
      payload.entityId,
    );
  }

  @MessagePattern(ASSETS_PATTERNS.UPDATE)
  async updateAsset(
    @Payload() payload: { id: string; updateAssetDto: UpdateAssetDto },
  ): Promise<AssetResponseDto> {
    return this.assetsService.updateAsset(payload.id, payload.updateAssetDto);
  }

  @MessagePattern(ASSETS_PATTERNS.DELETE)
  async deleteAsset(@Payload() payload: { id: string }): Promise<void> {
    const asset = await this.assetsService.getAssetById(payload.id);

    await this.assetsService.deleteAsset(payload.id);

    await this.assetsMaintenanceService.cleanupEntityAssets([asset.publicId]);
  }

  @MessagePattern(ASSETS_PATTERNS.DELETE_BY_PUBLIC_ID)
  async deleteAssetByPublicId(
    @Payload() payload: { publicId: string },
  ): Promise<void> {
    await this.assetsService.deleteAssetByPublicId(payload.publicId);

    await this.assetsMaintenanceService.cleanupEntityAssets([payload.publicId]);
  }

  @MessagePattern(ASSETS_PATTERNS.DELETE_BY_ENTITY)
  async deleteAssetsByEntity(
    @Payload() payload: { entityType: AssetEntityType; entityId: string },
  ): Promise<void> {
    const publicIds = await this.assetsService.deleteAssetsByEntity(
      payload.entityType,
      payload.entityId,
    );

    if (publicIds.length > 0) {
      await this.assetsMaintenanceService.cleanupEntityAssets(publicIds);
    }
  }

  @MessagePattern(ASSETS_PATTERNS.CLEANUP_ORPHANED)
  async cleanupOrphanedAssets(
    @Payload() payload: { publicIds: string[] },
  ): Promise<{ deletedDb: number; requested: number }> {
    const publicIds = Array.isArray(payload?.publicIds)
      ? payload.publicIds
      : [];

    const deletedDb =
      await this.assetsService.deleteAssetsByPublicIds(publicIds);

    try {
      await this.assetsMaintenanceService.cleanupEntityAssets(publicIds);
    } catch (_) {
      /* skip */
    }

    return { deletedDb, requested: publicIds.length };
  }

  @MessagePattern(ASSETS_PATTERNS.RECONCILE_ENTITY)
  async reconcileEntityAssets(
    @Payload() payload: { prevPublicIds: string[]; nextPublicIds: string[] },
  ): Promise<void> {
    await this.assetsMaintenanceService.reconcileEntityAssets(
      payload.prevPublicIds,
      payload.nextPublicIds,
    );
  }

  @MessagePattern(ASSETS_PATTERNS.HEALTH_CHECK)
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
