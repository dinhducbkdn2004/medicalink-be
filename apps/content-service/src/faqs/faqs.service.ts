import { Injectable, NotFoundException } from '@nestjs/common';
import { FaqRepository } from './faq.repository';
import {
  CreateFaqDto,
  UpdateFaqDto,
  FaqResponseDto,
  GetFaqsQueryDto,
} from '@app/contracts';

@Injectable()
export class FaqsService {
  constructor(private readonly faqRepository: FaqRepository) {}

  async create(data: CreateFaqDto): Promise<FaqResponseDto> {
    return this.faqRepository.create(data);
  }

  async update(id: string, data: UpdateFaqDto): Promise<FaqResponseDto> {
    try {
      return await this.faqRepository.update(id, data);
    } catch (_error) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
  }

  async findOne(id: string): Promise<FaqResponseDto> {
    const faq = await this.faqRepository.findOne(id);
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async findMany(query: GetFaqsQueryDto): Promise<FaqResponseDto[]> {
    return this.faqRepository.findMany(query);
  }

  async remove(id: string): Promise<void> {
    try {
      await this.faqRepository.remove(id);
    } catch (_error) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
  }

  async toggleActive(id: string): Promise<FaqResponseDto> {
    try {
      return await this.faqRepository.toggleActive(id);
    } catch (_error) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
  }
}
