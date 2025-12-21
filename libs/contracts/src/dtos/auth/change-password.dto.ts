import { IsString, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Current password must be a string' })
  @Length(6, 50, {
    message: 'Current password must be between 6 and 50 characters',
  })
  currentPassword: string;

  @IsString({ message: 'New password must be a string' })
  @Length(8, 50, {
    message: 'New password must be between 8 and 50 characters',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'New password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  newPassword: string;
}
