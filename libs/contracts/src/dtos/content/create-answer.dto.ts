import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAnswerDto {
  @IsString({ message: 'Answer body must be a string' })
  @IsNotEmpty({ message: 'Answer body cannot be empty' })
  body: string;
}
