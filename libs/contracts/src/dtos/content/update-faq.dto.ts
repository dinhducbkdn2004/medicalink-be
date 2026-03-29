import { PartialType } from '@nestjs/mapped-types';
import { CreateFaqDto } from './create-faq.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFaqDto extends PartialType(CreateFaqDto) {
  @IsString({ message: 'FAQ ID must be a string' })
  @IsNotEmpty({ message: 'FAQ ID is required' })
  id: string;
}
