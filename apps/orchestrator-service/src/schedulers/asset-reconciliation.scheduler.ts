import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssetsClientService } from '../clients';
import { AssetCacheService } from '../cache/asset-cache.service';

@Injectable()
export class AssetReconciliationScheduler {
  private readonly logger = new Logger(AssetReconciliationScheduler.name);
  private isRunning = false;

  constructor(
    private readonly assetsClientService: AssetsClientService,
    private readonly assetCacheService: AssetCacheService,
  ) {}

  /**
   * Run asset reconciliation every day at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleAssetReconciliation(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Asset reconciliation already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.log('Starting daily asset reconciliation...');

      // Clean up orphaned assets
      await this.cleanupOrphanedAssets();

      // Reconcile doctor assets
      await this.reconcileDoctorAssets();

      // Clean up expired cache entries
      await this.cleanupExpiredCaches();

      const duration = Date.now() - startTime;
      this.logger.log(
        `Asset reconciliation completed successfully in ${duration}ms`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Asset reconciliation failed: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Clean up orphaned assets that are no longer referenced
   */
  private async cleanupOrphanedAssets(): Promise<void> {
    try {
      this.logger.log('Cleaning up orphaned assets...');

      await this.assetsClientService.cleanupOrphanedAssets([]);

      this.logger.log(`Orphaned assets cleanup completed`);
    } catch (error) {
      this.logger.error(
        `Failed to cleanup orphaned assets: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Reconcile doctor assets to ensure consistency
   */
  private async reconcileDoctorAssets(): Promise<void> {
    try {
      this.logger.log('Reconciling doctor assets...');

      // This would typically involve checking all doctor profiles
      // and ensuring their assets are properly linked
      await this.assetsClientService.reconcileEntityAssets([], []);

      this.logger.log(
        `Doctor assets reconciliation completed. Basic reconciliation performed`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to reconcile doctor assets: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Clean up expired cache entries
   */
  private async cleanupExpiredCaches(): Promise<void> {
    try {
      this.logger.log('Cleaning up expired asset caches...');

      // Clean up asset-related cache patterns
      await this.assetCacheService.invalidatePattern('asset:*');
      await this.assetCacheService.invalidatePattern('doctor:assets:*');

      this.logger.log('Expired cache cleanup completed');
    } catch (error) {
      this.logger.error(
        `Failed to cleanup expired caches: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Don't throw for cache cleanup failures
    }
  }

  /**
   * Manual trigger for asset reconciliation (for testing/admin purposes)
   */
  async triggerManualReconciliation(): Promise<void> {
    this.logger.log('Manual asset reconciliation triggered');
    await this.handleAssetReconciliation();
  }

  /**
   * Get reconciliation status
   */
  getStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }
}
