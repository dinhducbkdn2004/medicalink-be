import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQHealthController } from './rabbitmq.health';
import { RabbitMQConfig } from './rabbitmq-config';

@Global()
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) =>
          RabbitMQConfig.createEventConfig(configService),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [RabbitMQHealthController],
  providers: [RabbitMQService],
  exports: [RabbitMQService, ClientsModule],
})
export class RabbitMQModule {}
