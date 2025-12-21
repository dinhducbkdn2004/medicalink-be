import { IsString, Length } from 'class-validator';

export class VerifyPasswordDto {
  @IsString({ message: 'Password must be a string' })
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters' })
  password: string;
}
