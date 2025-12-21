import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQConfig, QUEUE_NAMES } from '@app/rabbitmq';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ACCOUNTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.ACCOUNTS_QUEUE,
          ),
        inject: [ConfigService],
      },
      {
        name: 'PROVIDER_DIRECTORY_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.PROVIDER_QUEUE,
          ),
        inject: [ConfigService],
      },
      {
        name: 'BOOKING_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.BOOKING_QUEUE,
          ),
        inject: [ConfigService],
      },
      {
        name: 'CONTENT_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.CONTENT_QUEUE,
          ),
        inject: [ConfigService],
      },
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.NOTIFICATION_QUEUE,
          ),
        inject: [ConfigService],
      },
      {
        name: 'ORCHESTRATOR_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.ORCHESTRATOR_QUEUE,
          ),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MicroserviceClientsModule {}
