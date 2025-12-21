export interface ScheduleDto {
  id: string;
  doctorId: string;
  locationId: string;
  serviceDate: Date;
  timeStart: string;
  timeEnd: string;
  capacity: number;
}
