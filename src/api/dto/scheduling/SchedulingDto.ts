export type SchedulingBreakIntervalDto = {
  startTime: string;
  endTime: string;
};

export type PsychologistSchedulingSettingsDto = {
  psychologistId: string;
  sessionDurationMinutes: number;
  dayStartTime: string;
  dayEndTime: string;
  breakIntervals: SchedulingBreakIntervalDto[];
  updatedAt: string;
};

export type PsychologistAppointmentDto = {
  id: string;
  psychologistId: string;
  patientId: string | null;
  patientFullName: string | null;
  patientEmail: string | null;
  startsAt: string;
  durationMinutes: number;
  notes: string | null;
  isPersonalCommitment: boolean;
};

export type PsychologistSchedulingWeekDto = {
  settings: PsychologistSchedulingSettingsDto;
  weekStart: string;
  weekEnd: string;
  slotTimes: string[];
  appointments: PsychologistAppointmentDto[];
};

export type SchedulingConflictPreviewDto = {
  appointmentId: string;
  patientFullName: string | null;
  startsAt: string;
};

export type UpdateSchedulingSettingsResultDto =
  | {
      status: "saved";
      settings: PsychologistSchedulingSettingsDto;
      removedAppointmentIds: string[];
    }
  | {
      status: "confirmation_required";
      conflicts: SchedulingConflictPreviewDto[];
    };
