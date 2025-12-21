import { IStaffAccount } from '../../interfaces/staff-account.interface';

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: IStaffAccount;
}
