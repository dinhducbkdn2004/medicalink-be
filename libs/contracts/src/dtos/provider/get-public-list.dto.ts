import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common';

export class GetPublicListDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Specialty ID must be a string' })
  specialtyId?: string;

  @IsOptional()
  @IsString({ message: 'Work Location ID must be a string' })
  workLocationId?: string;
}
