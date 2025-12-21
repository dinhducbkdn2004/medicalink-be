import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

export interface RabbitMQMessage {
  pattern: string;
  data: any;
  options?: {
    timeout?: number;
    priority?: number;
  };
}

export interface RabbitMQMessageEvent {
  eventType: string;
  data: any;
  timestamp: Date;
  correlationId?: string;
}

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  /**
   * Send message to microservice
   */
  async sendMessage<T>(
    pattern: string,
    data: any,
    options: { timeout?: number } = {},
  ): Promise<T> {
    const { timeout: timeoutMs = this.DEFAULT_TIMEOUT } = options;

    try {
      this.logger.debug(`Sending message to pattern: ${pattern}`);

      const result = await firstValueFrom(
        this.client.send<T>(pattern, data).pipe(timeout(timeoutMs)),
      );

      this.logger.debug(`Message sent successfully to pattern: ${pattern}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send message to pattern ${pattern}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Emit event (fire and forget)
   */
  emitEvent(eventType: string, data: any, correlationId?: string): void {
    try {
      const event: RabbitMQMessageEvent = {
        eventType,
        data,
        timestamp: new Date(),
        correlationId,
      };

      this.logger.debug(`Emitting event: ${eventType}`);

      this.client.emit(eventType, event);

      this.logger.debug(`Event emitted successfully: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to emit event ${eventType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if service is available
   */
  async isServiceAvailable(serviceName: string): Promise<boolean> {
    try {
      await this.sendMessage('health.ping', {}, { timeout: 5000 });
      return true;
    } catch (error) {
      this.logger.warn(
        `Service ${serviceName} is not available: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Send message with retry logic
   */
  async sendMessageWithRetry<T>(
    pattern: string,
    data: any,
    options: {
      timeout?: number;
      maxRetries?: number;
      retryDelay?: number;
    } = {},
  ): Promise<T> {
    const {
      timeout: timeoutMs = this.DEFAULT_TIMEOUT,
      maxRetries = 3,
      retryDelay = 1000,
    } = options;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${maxRetries} for pattern: ${pattern}`,
        );

        return await this.sendMessage<T>(pattern, data, { timeout: timeoutMs });
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed for pattern ${pattern}: ${error.message}`,
        );

        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * attempt),
          );
        }
      }
    }

    this.logger.error(
      `All ${maxRetries} attempts failed for pattern ${pattern}`,
    );
    throw (
      lastError || new Error(`Failed to send message to pattern: ${pattern}`)
    );
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    timestamp: Date;
  }> {
    try {
      await this.client.connect();
      const isConnected = true;
      return {
        connected: isConnected,
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        connected: false,
        timestamp: new Date(),
      };
    }
  }
}
