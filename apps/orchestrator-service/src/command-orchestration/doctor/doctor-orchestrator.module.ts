import { Module } from '@nestjs/common';
import { DoctorOrchestratorService } from './doctor-orchestrator.service';
import { DoctorOrchestratorController } from './doctor-orchestrator.controller';
import { ClientsModule } from '../../clients/clients.module';
import { SagaModule } from '../../saga/saga.module';

@Module({
  imports: [ClientsModule, SagaModule],
  controllers: [DoctorOrchestratorController],
  providers: [DoctorOrchestratorService],
  exports: [DoctorOrchestratorService],
})
export class DoctorOrchestratorModule {}
