import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  resource: string;

  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  description?: string;
}
