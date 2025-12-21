export interface StaffStatsDto {
  total: number;
  byRole: {
    SUPER_ADMIN: number;
    ADMIN: number;
    DOCTOR: number;
  };
  recentlyCreated: number; // count of staffs created in current week
  deleted: number; // count of soft deleted staffs
}
