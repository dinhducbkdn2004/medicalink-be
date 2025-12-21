import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionRepository } from '../permission/permission.repository';
import { PermissionService } from './permission.service';
import { PermissionAssignmentService } from './permission-assignment.service';
import { AuthVersionModule } from '../auth-version/auth-version.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthVersionModule, AuthModule],
  controllers: [PermissionController],
  providers: [
    PermissionRepository,
    PermissionService,
    PermissionAssignmentService,
  ],
  exports: [
    PermissionRepository,
    PermissionService,
    PermissionAssignmentService,
  ],
})
export class PermissionModule {}
