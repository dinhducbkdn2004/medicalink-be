import { Module } from '@nestjs/common';
import { BulkAssetOperationsService } from './bulk-asset-operations.service';
import { ClientsModule } from '../clients/clients.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [ClientsModule, CacheModule],
  providers: [BulkAssetOperationsService],
  exports: [BulkAssetOperationsService],
})
export class ServicesModule {}
