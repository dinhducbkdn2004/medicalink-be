import { Inject, Injectable, Logger } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';
import { ConfigService } from '@nestjs/config';

/**
 * AssetsMaintenanceService: handle cleanup/replace assets on entity lifecycle.
 */
@Injectable()
export class AssetsMaintenanceService {
  private readonly logger = new Logger(AssetsMaintenanceService.name);

  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Delete all assets by their public IDs.
   */
  async cleanupEntityAssets(publicIds: string[]): Promise<void> {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return;
    }

    const uniqueIds = Array.from(new Set(publicIds.filter(Boolean)));

    // Process assets in parallel with concurrency limit
    const concurrencyLimit = 5;
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += concurrencyLimit) {
      chunks.push(uniqueIds.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map((publicId: string) => this.safeDestroy(publicId)),
      );
    }
  }

  /**
   * Reconcile assets during update: remove those not present anymore.
   */
  async reconcileEntityAssets(
    prevPublicIds: string[],
    nextPublicIds: string[],
  ): Promise<void> {
    const prev = new Set((prevPublicIds || []).filter(Boolean));
    const next = new Set((nextPublicIds || []).filter(Boolean));

    const removed: string[] = [];
    prev.forEach((id) => {
      if (!next.has(id)) removed.push(id);
    });

    await this.cleanupEntityAssets(removed);
  }

  private async safeDestroy(publicId: string): Promise<void> {
    const folder =
      this.configService.get<string>('SERVICE_NAME', { infer: true }) ||
      'medicalink';
    this.logger.log('SAFE DESTROY', publicId, folder);

    try {
      await this.cloudinary.uploader.destroy(`${folder}/${publicId}`);
    } catch (error) {
      this.logger.error(`Destroy failed for ${publicId}: ${error}`);
    }
  }
}
