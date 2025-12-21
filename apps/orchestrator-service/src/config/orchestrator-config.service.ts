import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrchestratorConfigService {
  private readonly logger = new Logger(OrchestratorConfigService.name);

  constructor(private readonly configService: ConfigService) {
    this.validateConfig();
  }

  /**
   * Get cache TTL for short-lived data (lists, searches)
   */
  get cacheTTLShort(): number {
    return (
      this.configService.get<number>('ORCHESTRATOR_CACHE_TTL_SHORT', {
        infer: true,
      }) ?? 120
    );
  }

  /**
   * Get cache TTL for medium-lived data (single entities)
   */
  get cacheTTLMedium(): number {
    return (
      this.configService.get<number>('ORCHESTRATOR_CACHE_TTL_MEDIUM', {
        infer: true,
      }) ?? 300
    );
  }

  /**
   * Get saga execution timeout
   */
  get sagaTimeout(): number {
    return (
      this.configService.get<number>('ORCHESTRATOR_SAGA_TIMEOUT', {
        infer: true,
      }) ?? 30000
    );
  }

  /**
   * Get service call timeout
   */
  get serviceTimeout(): number {
    return (
      this.configService.get<number>('ORCHESTRATOR_SERVICE_TIMEOUT', {
        infer: true,
      }) ?? 10000
    );
  }

  /**
   * Get RabbitMQ URL
   */
  get rabbitmqUrl(): string {
    return (
      this.configService.get<string>('RABBITMQ_URL', { infer: true }) ??
      'amqp://admin:admin123@localhost:5672'
    );
  }

  /**
   * Get Redis configuration
   */
  get redisConfig() {
    return {
      host:
        this.configService.get<string>('REDIS_HOST', { infer: true }) ??
        '127.0.0.1',
      port:
        this.configService.get<number>('REDIS_PORT', { infer: true }) ?? 6379,
      password: this.configService.get<string>('REDIS_PASSWORD', {
        infer: true,
      }),
      db: this.configService.get<number>('REDIS_DB', { infer: true }) ?? 0,
    };
  }

  /**
   * Validate required configuration
   */
  private validateConfig(): void {
    const required = ['RABBITMQ_URL', 'REDIS_HOST'];
    const missing = required.filter(
      (key) => !this.configService.get<string>(key, { infer: true }),
    );

    if (missing.length > 0) {
      this.logger.warn(
        `Missing configuration keys: ${missing.join(', ')}. Using defaults.`,
      );
    }
  }
}
