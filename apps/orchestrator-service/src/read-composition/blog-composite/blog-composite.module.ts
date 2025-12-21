import { Module } from '@nestjs/common';
import { BlogCompositeController } from './blog-composite.controller';
import { BlogCompositeService } from './blog-composite.service';
import { CacheModule } from '../../cache/cache.module';
import { ClientsModule } from '../../clients/clients.module';

@Module({
  imports: [CacheModule, ClientsModule],
  controllers: [BlogCompositeController],
  providers: [BlogCompositeService],
  exports: [BlogCompositeService],
})
export class BlogCompositeModule {}
