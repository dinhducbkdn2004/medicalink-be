import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsCuid } from '@app/contracts/decorators';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsCuid({ message: 'Review ID must be a valid CUID' })
  id: string;
}
