import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonialRepository } from './testimonial.repository';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
  TestimonialResponseDto,
  GetTestimonialsQueryDto,
} from '@app/contracts';

@Injectable()
export class TestimonialsService {
  constructor(private readonly testimonialRepository: TestimonialRepository) {}

  async create(data: CreateTestimonialDto): Promise<TestimonialResponseDto> {
    return this.testimonialRepository.create(data);
  }

  async update(
    id: string,
    data: UpdateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    try {
      return await this.testimonialRepository.update(id, data);
    } catch (_error) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
  }

  async findOne(id: string): Promise<TestimonialResponseDto> {
    const testimonial = await this.testimonialRepository.findOne(id);
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    return testimonial;
  }

  async findMany(
    query: GetTestimonialsQueryDto,
  ): Promise<TestimonialResponseDto[]> {
    return this.testimonialRepository.findMany(query);
  }

  async remove(id: string): Promise<void> {
    try {
      await this.testimonialRepository.remove(id);
    } catch (_error) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
  }

  async toggleFeatured(id: string): Promise<TestimonialResponseDto> {
    try {
      return await this.testimonialRepository.toggleFeatured(id);
    } catch (_error) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
  }
}
