import { Module } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialRepository } from './testimonial.repository';

@Module({
  controllers: [TestimonialsController],
  providers: [TestimonialsService, TestimonialRepository],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
