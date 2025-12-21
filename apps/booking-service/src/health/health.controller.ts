import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service';
import { HEALTH_PATTERNS } from '@app/rabbitmq';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @MessagePattern(HEALTH_PATTERNS.PING)
  ping(): string {
    return 'pong';
  }

  @MessagePattern(HEALTH_PATTERNS.STATUS)
  async status(): Promise<{
    service: string;
    db: 'healthy' | 'unhealthy';
    timestamp: string;
  }> {
    let db: 'healthy' | 'unhealthy' = 'unhealthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'healthy';
    } catch (_error) {
      db = 'unhealthy';
    }

    return {
      service: 'booking-service',
      db,
      timestamp: new Date().toISOString(),
    };
  }
}
