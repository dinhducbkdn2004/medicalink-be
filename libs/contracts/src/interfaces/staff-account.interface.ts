export interface IStaffAccount {
  id: string;
  fullName: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR';
  phone?: string | null;
  isMale?: boolean | null;
  dateOfBirth?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
