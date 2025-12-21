import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

export class RabbitMQConfig {
  static createClientConfig(configService: ConfigService, queueName: string) {
    const url = configService.getOrThrow<string>('RABBITMQ_URL', {
      infer: true,
    });
    return {
      transport: Transport.RMQ as any,
      options: {
        urls: [url],
        queue: queueName,
        queueOptions: {
          durable: true,
          arguments: {
            'x-message-ttl': 60000, // 1 minute TTL
            'x-max-retries': 3,
          },
        },
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
        prefetchCount: 1, // Process one message at a time
      },
    };
  }

  static createServerConfig(configService: ConfigService, queueName: string) {
    const url = configService.getOrThrow<string>('RABBITMQ_URL', {
      infer: true,
    });
    return {
      transport: Transport.RMQ as any,
      options: {
        urls: [url],
        queue: queueName,
        queueOptions: {
          durable: true,
          arguments: {
            'x-message-ttl': 60000,
            'x-max-retries': 3,
          },
        },
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
        prefetchCount: 1,
      },
    };
  }

  /**
   * Tạo cấu hình cho event publisher
   */
  static createEventConfig(configService: ConfigService) {
    const url = configService.getOrThrow<string>('RABBITMQ_URL', {
      infer: true,
    });
    return {
      transport: Transport.RMQ as any,
      options: {
        urls: [url],
        exchange: 'medicalink.topic',
        exchangeOptions: {
          durable: true,
          type: 'topic',
        },
        // Enable topic exchange type explicitly and wildcard pattern support
        exchangeType: 'topic',
        wildcards: true,
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
      },
    };
  }

  /**
   * Tạo cấu hình cho event subscriber
   */
  static createSubscriberConfig(
    configService: ConfigService,
    queueName: string,
    routingKey: string,
  ) {
    const url = configService.getOrThrow<string>('RABBITMQ_URL', {
      infer: true,
    });
    return {
      transport: Transport.RMQ as any,
      options: {
        urls: [url],
        exchange: 'medicalink.topic',
        exchangeOptions: {
          durable: true,
          type: 'topic',
        },
        // Explicitly set exchange type and enable wildcard matching for topic patterns
        exchangeType: 'topic',
        wildcards: true,
        queue: queueName,
        queueOptions: {
          durable: true,
          arguments: {
            'x-message-ttl': 300000, // 5 minutes TTL
          },
        },
        routingKey,
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
        prefetchCount: 1,
      },
    };
  }

  /**
   * Tạo cấu hình cho dead letter queue
   */
  static createDeadLetterConfig(
    configService: ConfigService,
    queueName: string,
  ) {
    const url = configService.getOrThrow<string>('RABBITMQ_URL', {
      infer: true,
    });
    return {
      transport: Transport.RMQ as any,
      options: {
        urls: [url],
        queue: `${queueName}.dlq`,
        queueOptions: {
          durable: true,
          arguments: {
            'x-message-ttl': 86400000, // 24 hours TTL
            'x-max-length': 1000, // Max 1000 messages
          },
        },
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
      },
    };
  }
}
