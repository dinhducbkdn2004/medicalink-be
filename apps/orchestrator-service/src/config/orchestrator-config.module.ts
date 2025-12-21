import { Module, Global } from '@nestjs/common';
import { OrchestratorConfigService } from './orchestrator-config.service';

@Global()
@Module({
  providers: [OrchestratorConfigService],
  exports: [OrchestratorConfigService],
})
export class OrchestratorConfigModule {}
