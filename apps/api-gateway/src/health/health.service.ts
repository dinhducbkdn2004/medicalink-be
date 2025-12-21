import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { HEALTH_PATTERNS } from '@app/rabbitmq';
import { MicroserviceService } from '../utils/microservice.service';
import { RabbitMQService } from '@app/rabbitmq';
import Redis from 'ioredis';

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  details?: any;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: ServiceHealth[];
  redis: {
    status: 'healthy' | 'unhealthy';
    responseTime: number;
  };
  rabbitmq: {
    status: 'healthy' | 'unhealthy';
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private redisClient: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly microserviceService: MicroserviceService,
    private readonly rabbitmqService: RabbitMQService,
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
    @Inject('PROVIDER_DIRECTORY_SERVICE')
    private readonly providerClient: ClientProxy,
    @Inject('BOOKING_SERVICE') private readonly bookingClient: ClientProxy,
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('ORCHESTRATOR_SERVICE')
    private readonly orchestratorClient: ClientProxy,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', {
        infer: true,
      }),
      port:
        this.configService.get<number>('REDIS_PORT', {
          infer: true,
        }) || 6379,
      username: this.configService.get<string>('REDIS_USERNAME', {
        infer: true,
      }),
      password: this.configService.get<string>('REDIS_PASSWORD', {
        infer: true,
      }),
      db: parseInt(
        this.configService.get<string>('REDIS_DB', {
          infer: true,
        }) || '0',
      ),
      connectTimeout: 5000,
      lazyConnect: true,
    });
  }

  async checkHealth(): Promise<HealthCheckResponse> {
    const serviceChecks = await Promise.all([
      this.checkService('accounts-service', this.accountsClient),
      this.checkService('provider-directory-service', this.providerClient),
      this.checkService('booking-service', this.bookingClient),
      this.checkService('content-service', this.contentClient),
      this.checkService('notification-service', this.notificationClient),
      this.checkService('orchestrator-service', this.orchestratorClient),
    ]);

    const redisCheck = await this.checkRedis();
    const rabbitCheck = await this.checkRabbitMQ();

    const healthyServices = serviceChecks.filter(
      (check) => check.status === 'healthy',
    ).length;
    const totalServices = serviceChecks.length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (
      redisCheck.status === 'unhealthy' ||
      rabbitCheck.status === 'unhealthy'
    ) {
      overallStatus = 'unhealthy';
    } else if (healthyServices === totalServices) {
      overallStatus = 'healthy';
    } else if (healthyServices > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: serviceChecks,
      redis: redisCheck,
      rabbitmq: rabbitCheck,
    };
  }

  private async checkService(
    serviceName: string,
    client: ClientProxy,
  ): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const isAvailable = await this.microserviceService.isServiceAvailable(
        client,
        serviceName,
      );
      // Optionally get DB status detail
      let details: any = undefined;
      try {
        details = await this.microserviceService.sendWithTimeout<any>(
          client,
          HEALTH_PATTERNS.STATUS,
          {},
          { timeoutMs: 3000 },
        );
      } catch (_e) {
        // ignore details failure
      }
      const responseTime = Date.now() - startTime;
      return {
        service: serviceName,
        status: isAvailable ? 'healthy' : 'unhealthy',
        responseTime,
        ...(details && { details }),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.warn(`Failed to check ${serviceName}: ${error.message}`);
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime,
        details: { error: error.message },
      };
    }
  }

  private async checkRedis(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime: number;
  }> {
    const startTime = Date.now();

    try {
      await this.redisClient.ping();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.warn(`Redis health check failed: ${error.message}`);

      return {
        status: 'unhealthy',
        responseTime,
      };
    }
  }

  private async checkRabbitMQ(): Promise<{
    status: 'healthy' | 'unhealthy';
  }> {
    try {
      const status = await this.rabbitmqService.getConnectionStatus();
      return { status: status.connected ? 'healthy' : 'unhealthy' };
    } catch (_e) {
      return { status: 'unhealthy' };
    }
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }
}
