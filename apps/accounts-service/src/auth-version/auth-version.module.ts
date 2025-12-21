import { Module } from '@nestjs/common';
import { AuthVersionController } from './auth-version.controller';
import { AuthVersionService } from './auth-version.service';
@Module({
  controllers: [AuthVersionController],
  providers: [AuthVersionService],
  exports: [AuthVersionService],
})
export class AuthVersionModule {}
