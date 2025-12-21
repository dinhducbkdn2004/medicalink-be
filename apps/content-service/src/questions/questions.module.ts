import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionRepository } from './question.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [AssetsModule],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionRepository, PrismaService],
  exports: [QuestionsService, QuestionRepository],
})
export class QuestionsModule {}
