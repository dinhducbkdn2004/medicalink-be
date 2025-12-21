import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientRepository } from './patients.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository, PrismaService],
  exports: [PatientsService, PatientRepository],
})
export class PatientsModule {}
