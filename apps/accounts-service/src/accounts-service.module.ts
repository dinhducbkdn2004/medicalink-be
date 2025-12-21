import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/redis';
import { RabbitMQModule } from '@app/rabbitmq';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StaffsModule } from './staffs/staffs.module';
import { DoctorAccountsModule } from './doctor-accounts/doctor-accounts.module';
import { PermissionModule } from './permission/permission.module';
import { AuthVersionModule } from './auth-version/auth-version.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    RabbitMQModule,
    PrismaModule,
    AuthModule,
    StaffsModule,
    DoctorAccountsModule,
    PermissionModule,
    AuthVersionModule,
  ],
  controllers: [HealthController],
})
export class AccountsServiceModule {}
