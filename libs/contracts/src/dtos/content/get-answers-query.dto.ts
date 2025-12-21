import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';
import { Transform } from 'class-transformer';

export class GetAnswersQueryDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase() === 'true')
  @IsBoolean({ message: 'isAccepted must be a boolean' })
  isAccepted?: boolean;
}
