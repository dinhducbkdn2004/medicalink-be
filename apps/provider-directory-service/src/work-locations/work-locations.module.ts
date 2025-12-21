import { Module } from '@nestjs/common';
import { WorkLocationsService } from './work-locations.service';
import { WorkLocationsController } from './work-locations.controller';
import { WorkLocationRepository } from './work-location.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [WorkLocationsController],
  providers: [WorkLocationsService, WorkLocationRepository, PrismaService],
  exports: [WorkLocationsService, WorkLocationRepository],
})
export class WorkLocationsModule {}
