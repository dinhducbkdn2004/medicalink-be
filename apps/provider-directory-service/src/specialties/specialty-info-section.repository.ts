import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SpecialtyInfoSection, Prisma } from '../../prisma/generated/client';
import {
  CreateSpecialtyInfoSectionDto,
  UpdateSpecialtyInfoSectionDto,
} from '@app/contracts';

@Injectable()
export class SpecialtyInfoSectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyBySpecialtyId(
    specialtyId: string,
  ): Promise<SpecialtyInfoSection[]> {
    return await this.prisma.specialtyInfoSection.findMany({
      where: { specialtyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<SpecialtyInfoSection | null> {
    return await this.prisma.specialtyInfoSection.findUnique({
      where: { id },
    });
  }

  async create(
    data: CreateSpecialtyInfoSectionDto,
  ): Promise<SpecialtyInfoSection> {
    return await this.prisma.specialtyInfoSection.create({
      data: {
        specialtyId: data.specialtyId,
        name: data.name,
        content: data.content,
      },
    });
  }

  async update(
    id: string,
    data: UpdateSpecialtyInfoSectionDto,
  ): Promise<SpecialtyInfoSection> {
    const updateData: Prisma.SpecialtyInfoSectionUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.content !== undefined) {
      updateData.content = data.content;
    }

    return await this.prisma.specialtyInfoSection.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<SpecialtyInfoSection> {
    return await this.prisma.specialtyInfoSection.delete({
      where: { id },
    });
  }

  async countBySpecialtyId(specialtyId: string): Promise<number> {
    return await this.prisma.specialtyInfoSection.count({
      where: { specialtyId },
    });
  }
}
