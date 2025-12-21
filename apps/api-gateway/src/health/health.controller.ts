import { Controller, Get } from '@nestjs/common';
import { Public } from '@app/contracts';
import { HealthService, HealthCheckResponse } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  async getHealth(): Promise<HealthCheckResponse> {
    return this.healthService.checkHealth();
  }

  @Get('simple')
  @Public()
  async getSimpleHealth(): Promise<{ status: string; timestamp: string }> {
    const health = await this.healthService.checkHealth();
    return {
      status: health.status,
      timestamp: health.timestamp,
    };
  }
}
