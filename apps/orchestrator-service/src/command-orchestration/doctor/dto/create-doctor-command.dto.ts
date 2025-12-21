import { IsOptional, IsString } from 'class-validator';
import { CreateAccountDto } from '@app/contracts';

/**
 * Command DTO for creating a complete doctor (account + profile)
 * Extends CreateAccountDto from contracts
 */
export class CreateDoctorCommandDto extends CreateAccountDto {
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  correlationId?: string;

  @IsOptional()
  @IsString()
  userId?: string; // User performing this action (for audit)
}
