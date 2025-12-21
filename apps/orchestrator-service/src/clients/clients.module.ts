import { Module } from '@nestjs/common';
import { ClientsModule as NestClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RabbitMQConfig, QUEUE_NAMES } from '@app/rabbitmq';
import { MicroserviceClientHelper } from './microservice-client.helper';
import { AssetsClientService } from './assets-client.service';

@Module({
  imports: [
    NestClientsModule.registerAsync([
      {
        name: 'ACCOUNTS_SERVICE',
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.ACCOUNTS_QUEUE,
          ),
        inject: [ConfigService],
      },
      {
        name: 'PROVIDER_DIRECTORY_SERVICE',
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.PROVIDER_QUEUE,
          ),
        inject: [ConfigService],
      },
      {
        name: 'BOOKING_SERVICE',
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.BOOKING_QUEUE,
          ),
        inject: [ConfigService],
      },
      {
        name: 'CONTENT_SERVICE',
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.CONTENT_QUEUE,
          ),
        inject: [ConfigService],
      },
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createClientConfig(
            configService,
            QUEUE_NAMES.NOTIFICATION_QUEUE,
          ),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [MicroserviceClientHelper, AssetsClientService],
  exports: [NestClientsModule, MicroserviceClientHelper, AssetsClientService],
})
export class ClientsModule {}
