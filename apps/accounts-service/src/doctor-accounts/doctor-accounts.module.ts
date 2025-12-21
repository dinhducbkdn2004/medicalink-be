import { Module } from '@nestjs/common';
import { DoctorAccountsController } from './doctor-accounts.controller';
import { DoctorAccountsService } from './doctor-accounts.service';
import { StaffRepository } from '../staffs/staff.repository';
import { PermissionModule } from '../permission/permission.module';
import { RabbitMQService } from '@app/rabbitmq';

@Module({
  imports: [PermissionModule],
  controllers: [DoctorAccountsController],
  providers: [DoctorAccountsService, StaffRepository, RabbitMQService],
  exports: [DoctorAccountsService],
})
export class DoctorAccountsModule {}
