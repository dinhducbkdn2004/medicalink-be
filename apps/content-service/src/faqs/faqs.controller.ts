import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FaqsService } from './faqs.service';
import {
  FAQS_PATTERNS,
  CreateFaqDto,
  UpdateFaqDto,
  GetFaqsQueryDto,
} from '@app/contracts';

@Controller()
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @MessagePattern(FAQS_PATTERNS.CREATE)
  create(@Payload() data: CreateFaqDto) {
    return this.faqsService.create(data);
  }

  @MessagePattern(FAQS_PATTERNS.UPDATE)
  update(@Payload() data: UpdateFaqDto) {
    return this.faqsService.update(data.id, data);
  }

  @MessagePattern(FAQS_PATTERNS.REMOVE)
  remove(@Payload() id: string) {
    return this.faqsService.remove(id);
  }

  @MessagePattern(FAQS_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string) {
    return this.faqsService.findOne(id);
  }

  @MessagePattern(FAQS_PATTERNS.FIND_MANY)
  findMany(@Payload() query: GetFaqsQueryDto) {
    return this.faqsService.findMany(query);
  }

  @MessagePattern(FAQS_PATTERNS.FIND_MANY_PUBLIC)
  findManyPublic(@Payload() query: GetFaqsQueryDto) {
    return this.faqsService.findMany({ ...query, isActive: true });
  }

  @MessagePattern(FAQS_PATTERNS.TOGGLE_ACTIVE)
  toggleActive(@Payload() id: string) {
    return this.faqsService.toggleActive(id);
  }
}
