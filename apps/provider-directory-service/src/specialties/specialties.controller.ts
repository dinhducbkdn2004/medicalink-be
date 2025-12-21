import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SpecialtiesService } from './specialties.service';
import {
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyQueryDto,
  SpecialtyResponseDto,
  SpecialtyPaginatedResponseDto,
  SpecialtyPublicPaginatedResponseDto,
  SpecialtyWithInfoSectionsResponseDto,
  CreateSpecialtyInfoSectionDto,
  UpdateSpecialtyInfoSectionDto,
  SpecialtyInfoSectionResponseDto,
} from '@app/contracts';
import {
  SPECIALTIES_PATTERNS,
  SPECIALTY_INFO_SECTIONS_PATTERNS,
} from '@app/contracts/patterns';

@Controller()
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @MessagePattern(SPECIALTIES_PATTERNS.FIND_ALL_PUBLIC)
  async findAll(
    @Payload() query: SpecialtyQueryDto,
  ): Promise<SpecialtyPublicPaginatedResponseDto> {
    return this.specialtiesService.findAllPublic(query);
  }

  @MessagePattern(SPECIALTIES_PATTERNS.FIND_ALL_ADMIN)
  async findAllAdmin(
    @Payload() query: SpecialtyQueryDto,
  ): Promise<SpecialtyPaginatedResponseDto> {
    return this.specialtiesService.findAllAdmin(query);
  }

  @MessagePattern(SPECIALTIES_PATTERNS.FIND_ONE)
  async findOne(@Payload() id: string): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.findOne(id);
  }

  @MessagePattern(SPECIALTIES_PATTERNS.FIND_BY_SLUG)
  async findBySlug(
    @Payload() slug: string,
  ): Promise<SpecialtyWithInfoSectionsResponseDto> {
    return this.specialtiesService.findBySlugWithInfoSections(slug);
  }

  @MessagePattern(SPECIALTIES_PATTERNS.CREATE)
  async create(
    @Payload() createSpecialtyDto: CreateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.create(createSpecialtyDto);
  }

  @MessagePattern(SPECIALTIES_PATTERNS.UPDATE)
  async update(
    @Payload() payload: { id: string; data: UpdateSpecialtyDto },
  ): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.update(payload.id, payload.data);
  }

  @MessagePattern(SPECIALTIES_PATTERNS.REMOVE)
  async remove(@Payload() id: string): Promise<SpecialtyResponseDto> {
    return this.specialtiesService.remove(id);
  }

  @MessagePattern(SPECIALTIES_PATTERNS.GET_STATS)
  async getStats(): Promise<{
    total: number;
    recentlyCreated: number;
  }> {
    return this.specialtiesService.getStats();
  }

  @MessagePattern(SPECIALTY_INFO_SECTIONS_PATTERNS.GET_BY_SPECIALTY_ID)
  async findInfoSectionsBySpecialtyId(
    @Payload() specialtyId: string,
  ): Promise<SpecialtyInfoSectionResponseDto[]> {
    return this.specialtiesService.findInfoSectionsBySpecialtyId(specialtyId);
  }

  @MessagePattern(SPECIALTY_INFO_SECTIONS_PATTERNS.CREATE)
  async createInfoSection(
    @Payload()
    payload: CreateSpecialtyInfoSectionDto,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    return this.specialtiesService.createInfoSection(payload);
  }

  @MessagePattern(SPECIALTY_INFO_SECTIONS_PATTERNS.UPDATE)
  async updateInfoSection(
    @Payload() payload: { id: string; data: UpdateSpecialtyInfoSectionDto },
  ): Promise<SpecialtyInfoSectionResponseDto> {
    return this.specialtiesService.updateInfoSection(payload.id, payload.data);
  }

  @MessagePattern(SPECIALTY_INFO_SECTIONS_PATTERNS.REMOVE)
  async deleteInfoSection(
    @Payload() id: string,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    return this.specialtiesService.deleteInfoSection(id);
  }
}
