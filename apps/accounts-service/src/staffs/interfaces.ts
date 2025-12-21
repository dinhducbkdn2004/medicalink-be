import { StaffAccount } from '../../prisma/generated/client';

export type StaffResponse = Omit<StaffAccount, 'passwordHash'>;
