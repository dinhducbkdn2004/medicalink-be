import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetResponseDto,
  GetAssetsQueryDto,
  AssetsListResponseDto,
  AssetEntityType,
} from '@app/contracts';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAsset(createAssetDto: CreateAssetDto): Promise<AssetResponseDto> {
    // Check if asset with same publicId already exists
    const existingAsset = await this.prisma.asset.findUnique({
      where: { publicId: createAssetDto.publicId },
    });

    if (existingAsset) {
      throw new ConflictException(
        `Asset with publicId '${createAssetDto.publicId}' already exists`,
      );
    }

    const asset = await this.prisma.asset.create({
      data: {
        entityType: createAssetDto.entityType,
        entityId: createAssetDto.entityId,
        publicId: createAssetDto.publicId,
        metadata: createAssetDto.metadata,
      },
    });

    return this.mapToResponseDto(asset);
  }

  async getAssetById(id: string): Promise<AssetResponseDto> {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id '${id}' not found`);
    }

    return this.mapToResponseDto(asset);
  }

  async getAssetByPublicId(publicId: string): Promise<AssetResponseDto> {
    const asset = await this.prisma.asset.findUnique({
      where: { publicId },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with publicId '${publicId}' not found`,
      );
    }

    return this.mapToResponseDto(asset);
  }

  async getAssets(query: GetAssetsQueryDto): Promise<AssetsListResponseDto> {
    const { entityType, entityId, publicId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (publicId) where.publicId = { contains: publicId, mode: 'insensitive' };

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: assets.map((asset) => this.mapToResponseDto(asset)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getAssetsByEntity(
    entityType: AssetEntityType,
    entityId: string,
  ): Promise<AssetResponseDto[]> {
    const assets = await this.prisma.asset.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((asset) => this.mapToResponseDto(asset));
  }

  async updateAsset(
    id: string,
    updateAssetDto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    // Check if asset exists
    const existingAsset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      throw new NotFoundException(`Asset with id '${id}' not found`);
    }

    // Check if new publicId conflicts with existing asset
    if (
      updateAssetDto.publicId &&
      updateAssetDto.publicId !== existingAsset.publicId
    ) {
      const conflictingAsset = await this.prisma.asset.findUnique({
        where: { publicId: updateAssetDto.publicId },
      });

      if (conflictingAsset) {
        throw new ConflictException(
          `Asset with publicId '${updateAssetDto.publicId}' already exists`,
        );
      }
    }

    const asset = await this.prisma.asset.update({
      where: { id },
      data: {
        publicId: updateAssetDto.publicId,
        metadata: updateAssetDto.metadata,
      },
    });

    return this.mapToResponseDto(asset);
  }

  async deleteAsset(id: string): Promise<void> {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id '${id}' not found`);
    }

    await this.prisma.asset.delete({
      where: { id },
    });
  }

  async deleteAssetsByEntity(
    entityType: AssetEntityType,
    entityId: string,
  ): Promise<string[]> {
    const assets = await this.prisma.asset.findMany({
      where: {
        entityType,
        entityId,
      },
      select: { publicId: true },
    });

    const publicIds = assets.map((asset) => asset.publicId);

    await this.prisma.asset.deleteMany({
      where: {
        entityType,
        entityId,
      },
    });

    return publicIds;
  }

  async deleteAssetByPublicId(publicId: string): Promise<void> {
    const asset = await this.prisma.asset.findUnique({
      where: { publicId },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with publicId '${publicId}' not found`,
      );
    }

    await this.prisma.asset.delete({
      where: { publicId },
    });
  }

  /**
   * Delete many assets by their public IDs. Idempotent: ignores missing records.
   * Returns number of records deleted.
   */
  async deleteAssetsByPublicIds(publicIds: string[]): Promise<number> {
    const uniqueIds = Array.from(new Set((publicIds || []).filter(Boolean)));
    if (uniqueIds.length === 0) return 0;

    const result = await this.prisma.asset.deleteMany({
      where: { publicId: { in: uniqueIds } },
    });

    return result.count;
  }

  private mapToResponseDto(asset: any): AssetResponseDto {
    return {
      id: asset.id,
      entityType: asset.entityType,
      entityId: asset.entityId,
      publicId: asset.publicId,
      metadata: asset.metadata,
      createdAt: asset.createdAt,
    };
  }
}
