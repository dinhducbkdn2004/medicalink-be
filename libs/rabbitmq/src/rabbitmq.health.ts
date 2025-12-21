import { Controller, Get } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Controller('health/rabbitmq')
export class RabbitMQHealthController {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  @Get()
  async checkHealth() {
    try {
      const status = await this.rabbitMQService.getConnectionStatus();

      return {
        status: status.connected ? 'healthy' : 'unhealthy',
        timestamp: status.timestamp.toISOString(),
        service: 'rabbitmq',
        details: {
          connected: status.connected,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'rabbitmq',
        error: error.message,
      };
    }
  }

  @Get('ping')
  async ping() {
    try {
      const isAvailable =
        await this.rabbitMQService.isServiceAvailable('health');

      return {
        status: isAvailable ? 'pong' : 'error',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
