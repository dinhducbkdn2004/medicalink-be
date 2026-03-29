import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { FaqRepository } from './faq.repository';

@Module({
  controllers: [FaqsController],
  providers: [FaqsService, FaqRepository],
  exports: [FaqsService],
})
export class FaqsModule {}
