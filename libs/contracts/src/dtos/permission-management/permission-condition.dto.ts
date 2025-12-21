import { IsEnum, IsString } from 'class-validator';

export class PermissionConditionDto {
  @IsString()
  field: string;

  @IsEnum(['eq', 'ne', 'in', 'contains'])
  operator: 'eq' | 'ne' | 'in' | 'contains';

  @IsString()
  value: any;
}
