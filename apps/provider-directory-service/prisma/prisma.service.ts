import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from './generated/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasourceUrl: process.env.PROVIDER_DATABASE_URL,
      log: ['warn', 'error'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Provider Directory Service - Prisma Client Connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Provider Directory Service - Prisma Client Disconnected');
  }

  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      this.logger.log(
        'Provider Directory Service - Prisma received beforeExit event',
      );
      void app.close();
    });
  }
}
