import { Module } from '@nestjs/common';
import { DoctorCompositeController } from './doctor-composite.controller';
import { DoctorCompositeService } from './doctor-composite.service';
import { CacheModule } from '../../cache/cache.module';
import { ClientsModule } from '../../clients/clients.module';

@Module({
  imports: [CacheModule, ClientsModule],
  controllers: [DoctorCompositeController],
  providers: [DoctorCompositeService],
  exports: [DoctorCompositeService],
})
export class DoctorCompositeModule {}
