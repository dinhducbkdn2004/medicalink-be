import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFaqDto,
  UpdateFaqDto,
  FaqResponseDto,
  GetFaqsQueryDto,
} from '@app/contracts';

@Injectable()
export class FaqRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFaqDto): Promise<FaqResponseDto> {
    return await this.prisma.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: UpdateFaqDto): Promise<FaqResponseDto> {
    const { id: _, ...updateData } = data;
    return await this.prisma.faq.update({
      where: { id },
      data: updateData,
    });
  }

  async findOne(id: string): Promise<FaqResponseDto | null> {
    return await this.prisma.faq.findUnique({
      where: { id },
    });
  }

  async findMany(query: GetFaqsQueryDto): Promise<FaqResponseDto[]> {
    const { search, isActive } = query;
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.faq.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.faq.delete({
      where: { id },
    });
  }

  async toggleActive(id: string): Promise<FaqResponseDto> {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new Error('FAQ not found');

    return this.prisma.faq.update({
      where: { id },
      data: { isActive: !faq.isActive },
    });
  }
}
