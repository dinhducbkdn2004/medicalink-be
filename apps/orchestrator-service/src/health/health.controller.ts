import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HealthService } from './health.service';
import { HEALTH_PATTERNS } from '@app/rabbitmq';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @MessagePattern(HEALTH_PATTERNS.STATUS)
  checkHealth() {
    return this.healthService.check();
  }

  @MessagePattern(HEALTH_PATTERNS.PING)
  ping() {
    return { status: 'ok', service: 'orchestrator', timestamp: new Date() };
  }
}
