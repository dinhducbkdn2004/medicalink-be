import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export abstract class BasePrismaService implements OnModuleInit {
  abstract $connect(): Promise<void>;
  abstract $disconnect(): Promise<void>;

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
