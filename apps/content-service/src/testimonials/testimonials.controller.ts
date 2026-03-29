import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TestimonialsService } from './testimonials.service';
import {
  TESTIMONIALS_PATTERNS,
  CreateTestimonialDto,
  UpdateTestimonialDto,
  GetTestimonialsQueryDto,
} from '@app/contracts';

@Controller()
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @MessagePattern(TESTIMONIALS_PATTERNS.CREATE)
  create(@Payload() data: CreateTestimonialDto) {
    return this.testimonialsService.create(data);
  }

  @MessagePattern(TESTIMONIALS_PATTERNS.UPDATE)
  update(@Payload() data: UpdateTestimonialDto) {
    return this.testimonialsService.update(data.id, data);
  }

  @MessagePattern(TESTIMONIALS_PATTERNS.REMOVE)
  remove(@Payload() id: string) {
    return this.testimonialsService.remove(id);
  }

  @MessagePattern(TESTIMONIALS_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string) {
    return this.testimonialsService.findOne(id);
  }

  @MessagePattern(TESTIMONIALS_PATTERNS.FIND_MANY)
  findMany(@Payload() query: GetTestimonialsQueryDto) {
    return this.testimonialsService.findMany(query);
  }

  @MessagePattern(TESTIMONIALS_PATTERNS.FIND_MANY_PUBLIC)
  findManyPublic(@Payload() query: GetTestimonialsQueryDto) {
    return this.testimonialsService.findMany({ ...query, isFeatured: true });
  }

  @MessagePattern(TESTIMONIALS_PATTERNS.TOGGLE_FEATURED)
  toggleFeatured(@Payload() id: string) {
    return this.testimonialsService.toggleFeatured(id);
  }
}
