// Base Event Interface
export interface BaseEvent {
  event: string;
  occurredAt: string;
}

// Account Events
export interface PatientProfileUpdated extends BaseEvent {
  event: 'PatientProfileUpdated';
  data: {
    patientId: string;
  };
}

export interface StaffCreated extends BaseEvent {
  event: 'StaffCreated';
  data: {
    staffId: string;
  };
}

export interface StaffUpdated extends BaseEvent {
  event: 'StaffUpdated';
  data: {
    staffId: string;
  };
}

export interface StaffRoleChanged extends BaseEvent {
  event: 'StaffRoleChanged';
  data: {
    staffId: string;
  };
}

// Doctor Profile Events with Asset Management
export interface DoctorProfileCreated extends BaseEvent {
  event: 'DoctorProfileCreated';
  data: {
    profileId: string;
    staffAccountId: string;
    assets: string[]; // Array of Cloudinary public IDs
  };
}

export interface DoctorProfileUpdated extends BaseEvent {
  event: 'DoctorProfileUpdated';
  data: {
    profileId: string;
    staffAccountId: string;
    prevAssets: string[]; // Previous asset public IDs
    nextAssets: string[]; // New asset public IDs
  };
}

export interface DoctorProfileDeleted extends BaseEvent {
  event: 'DoctorProfileDeleted';
  data: {
    profileId: string;
    staffAccountId?: string;
    assetPublicIds: string[]; // Assets to be cleaned up
  };
}

// Specialty Events with Asset Management
export interface SpecialtyCreated extends BaseEvent {
  event: 'SpecialtyCreated';
  data: {
    specialtyId: string;
    iconAssets: string[]; // Array of Cloudinary public IDs for icon
  };
}

export interface SpecialtyUpdated extends BaseEvent {
  event: 'SpecialtyUpdated';
  data: {
    specialtyId: string;
    prevIconAssets: string[]; // Previous icon asset public IDs
    nextIconAssets: string[]; // New icon asset public IDs
  };
}

export interface SpecialtyDeleted extends BaseEvent {
  event: 'SpecialtyDeleted';
  data: {
    specialtyId: string;
    assetPublicIds: string[]; // Assets to be cleaned up
  };
}

// Provider Events
export interface ScheduleSlotCreated extends BaseEvent {
  event: 'ScheduleSlotCreated';
  data: {
    scheduleId: string;
    doctorId: string;
    locationId: string;
  };
}

export interface ScheduleSlotUpdated extends BaseEvent {
  event: 'ScheduleSlotUpdated';
  data: {
    scheduleId: string;
    doctorId: string;
    locationId: string;
  };
}

export interface ScheduleSlotDeleted extends BaseEvent {
  event: 'ScheduleSlotDeleted';
  data: {
    scheduleId: string;
    doctorId: string;
    locationId: string;
  };
}

// Booking Events
export interface AppointmentBooked extends BaseEvent {
  event: 'AppointmentBooked';
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    scheduleId: string;
    locationId: string;
  };
}

export interface AppointmentConfirmed extends BaseEvent {
  event: 'AppointmentConfirmed';
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
  };
}

export interface AppointmentRescheduled extends BaseEvent {
  event: 'AppointmentRescheduled';
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    oldScheduleId: string;
    newScheduleId: string;
  };
}

export interface AppointmentCancelled extends BaseEvent {
  event: 'AppointmentCancelled';
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
  };
}

// Content Events
export interface BlogCreated extends BaseEvent {
  event: 'BlogCreated';
  data: {
    blogId: string;
  };
}

export interface BlogUpdated extends BaseEvent {
  event: 'BlogUpdated';
  data: {
    blogId: string;
  };
}

export interface BlogDeleted extends BaseEvent {
  event: 'BlogDeleted';
  data: {
    blogId: string;
  };
}

export interface QuestionCreated extends BaseEvent {
  event: 'QuestionCreated';
  data: {
    questionId: string;
  };
}

export interface AnswerPosted extends BaseEvent {
  event: 'AnswerPosted';
  data: {
    answerId: string;
    questionId: string;
  };
}

export interface ReviewCreated extends BaseEvent {
  event: 'ReviewCreated';
  data: {
    reviewId: string;
    doctorId: string;
  };
}

// Union type for all events
export type AllEvents =
  | PatientProfileUpdated
  | StaffCreated
  | StaffUpdated
  | StaffRoleChanged
  | DoctorProfileCreated
  | DoctorProfileUpdated
  | DoctorProfileDeleted
  | SpecialtyCreated
  | SpecialtyUpdated
  | SpecialtyDeleted
  | ScheduleSlotCreated
  | ScheduleSlotUpdated
  | ScheduleSlotDeleted
  | AppointmentBooked
  | AppointmentConfirmed
  | AppointmentRescheduled
  | AppointmentCancelled
  | BlogCreated
  | BlogUpdated
  | BlogDeleted
  | QuestionCreated
  | AnswerPosted
  | ReviewCreated;

export type EventType = AllEvents['event'];
