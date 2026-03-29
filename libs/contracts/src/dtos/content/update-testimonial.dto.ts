import { PartialType } from '@nestjs/mapped-types';
import { CreateTestimonialDto } from './create-testimonial.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {
  @IsString({ message: 'Testimonial ID must be a string' })
  @IsNotEmpty({ message: 'Testimonial ID is required' })
  id: string;
}
