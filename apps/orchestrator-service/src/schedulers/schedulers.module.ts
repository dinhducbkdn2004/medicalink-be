import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule } from '../clients/clients.module';
import { CacheModule } from '../cache/cache.module';
import { AssetReconciliationScheduler } from './asset-reconciliation.scheduler';

@Module({
  imports: [ScheduleModule.forRoot(), ClientsModule, CacheModule],
  providers: [AssetReconciliationScheduler],
  exports: [AssetReconciliationScheduler],
})
export class SchedulersModule {}
