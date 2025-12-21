import { IsArray, IsString } from 'class-validator';

export class GetStaffByIdsDto {
  @IsArray({ message: 'Staff IDs must be an array' })
  @IsString({ each: true, message: 'Each staff ID must be a string' })
  staffIds: string[];
}

export class StaffBasicInfoDto {
  id: string;
  fullName: string;
}
