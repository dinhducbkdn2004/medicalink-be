import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
  TestimonialResponseDto,
  GetTestimonialsQueryDto,
} from '@app/contracts';

@Injectable()
export class TestimonialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTestimonialDto): Promise<TestimonialResponseDto> {
    return this.prisma.testimonial.create({
      data: {
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        authorTitle: data.authorTitle,
        content: data.content,
        rating: data.rating ?? 5,
        isFeatured: data.isFeatured ?? false,
      },
    });
  }

  async update(
    id: string,
    data: UpdateTestimonialDto,
  ): Promise<TestimonialResponseDto> {
    const { id: _, ...updateData } = data;
    return this.prisma.testimonial.update({
      where: { id },
      data: updateData,
    });
  }

  async findOne(id: string): Promise<TestimonialResponseDto | null> {
    return this.prisma.testimonial.findUnique({
      where: { id },
    });
  }

  async findMany(
    query: GetTestimonialsQueryDto,
  ): Promise<TestimonialResponseDto[]> {
    const { search, isFeatured } = query;
    const where: any = {};

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search) {
      where.OR = [
        { authorName: { contains: search, mode: 'insensitive' } },
        { authorTitle: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.testimonial.delete({
      where: { id },
    });
  }

  async toggleFeatured(id: string): Promise<TestimonialResponseDto> {
    const testimonial = await this.prisma.testimonial.findUnique({
      where: { id },
    });
    if (!testimonial) throw new Error('Testimonial not found');

    return this.prisma.testimonial.update({
      where: { id },
      data: { isFeatured: !testimonial.isFeatured },
    });
  }
}
