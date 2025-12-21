import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { WorkLocationPublicQueryDto } from './work-location-public-query.dto';

export class WorkLocationQueryDto extends WorkLocationPublicQueryDto {
  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Include metadata must be a boolean' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeMetadata?: boolean;
}
