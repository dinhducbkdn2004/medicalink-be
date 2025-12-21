import { IsCuid } from '@app/contracts';
import { IsString, IsNotEmpty } from 'class-validator';

export class SCreateAnswerDto {
  @IsCuid({ message: 'Question ID must be a valid CUID' })
  @IsNotEmpty({ message: 'Question ID cannot be empty' })
  questionId: string;

  @IsCuid({ message: 'Author ID must be a valid CUID' })
  @IsNotEmpty({ message: 'Author ID cannot be empty' })
  authorId: string;

  @IsString({ message: 'Answer body must be a string' })
  @IsNotEmpty({ message: 'Answer body cannot be empty' })
  body: string;
}
