import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { AssetCacheService } from './asset-cache.service';

@Module({
  providers: [CacheService, AssetCacheService],
  exports: [CacheService, AssetCacheService],
})
export class CacheModule {}
