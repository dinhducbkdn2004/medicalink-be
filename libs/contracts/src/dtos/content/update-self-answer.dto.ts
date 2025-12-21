import { PartialType } from '@nestjs/mapped-types';
import { CreateAnswerDto } from './create-answer.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSelfAnswerDto extends PartialType(CreateAnswerDto) {
  @IsString({ message: 'Answer body must be a string' })
  @IsNotEmpty({ message: 'Answer body cannot be empty' })
  body: string;
}
