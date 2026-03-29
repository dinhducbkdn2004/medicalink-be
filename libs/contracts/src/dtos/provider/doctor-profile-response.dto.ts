import { SpecialtyDto, WorkLocationDto } from '../common';

export class DoctorProfileResponseDto {
  id: string;
  staffAccountId: string;
  fullName: string;
  isMale: boolean | null;
  isActive: boolean;
  appointmentDuration: number;
  degree?: string;
  position: string[];
  introduction?: string;
  memberships: string[];
  awards: string[];
  research?: string;
  trainingProcess: string[];
  experience: string[];
  avatarUrl: string | null;
  portrait: string | null;
  createdAt: Date;
  updatedAt: Date;
  specialties?: SpecialtyDto[];
  workLocations?: WorkLocationDto[];
}
