import type {
  PsychologistAppointmentDto,
  PsychologistSchedulingWeekDto,
  SchedulingBreakIntervalDto,
  UpdateSchedulingSettingsResultDto,
} from "../../dto/scheduling/SchedulingDto";
import { apiRequest } from "../../http/apiClient";
import { keysToCamel } from "@helpers";

type SchedulingWeekResponse = {
  scheduling: PsychologistSchedulingWeekDto;
};

type UpdateSettingsResponse = {
  result: UpdateSchedulingSettingsResultDto;
};

type CreateAppointmentResponse = {
  appointment: PsychologistAppointmentDto;
};

type MoveAppointmentsResponse = {
  appointments: PsychologistAppointmentDto[];
};

export type UpdateSchedulingSettingsPayload = {
  sessionDurationMinutes: number;
  dayStartTime: string;
  dayEndTime: string;
  breakIntervals: SchedulingBreakIntervalDto[];
  confirmRemoveConflicts?: boolean;
  tzOffset: number;
};

export type CreatePatientAppointmentPayload = {
  patientId: string;
  startsAt: string;
  durationMinutes?: number;
  notes?: string | null;
  weekStart: string;
  tzOffset: number;
  isPersonalCommitment?: false;
};

export type CreatePersonalCommitmentPayload = {
  isPersonalCommitment: true;
  startsAt: string;
  personalDescription: string;
  durationMinutes?: number;
  weekStart: string;
  tzOffset: number;
};

export type CreateAppointmentPayload =
  | CreatePatientAppointmentPayload
  | CreatePersonalCommitmentPayload;

export type CreateAppointmentInput =
  | Omit<CreatePatientAppointmentPayload, "weekStart" | "tzOffset">
  | Omit<CreatePersonalCommitmentPayload, "weekStart" | "tzOffset">;

export type MoveAppointmentPayload = {
  startsAt: string;
  weekStart: string;
  tzOffset: number;
};

export const getPsychologistSchedulingWeekApi = async (
  weekStart: string,
  tzOffset: number,
): Promise<PsychologistSchedulingWeekDto> => {
  const response = await apiRequest<SchedulingWeekResponse>("/psychologist/scheduling", {
    query: { weekStart, tzOffset },
  });
  return keysToCamel<SchedulingWeekResponse>(response).scheduling;
};

export const updatePsychologistSchedulingSettingsApi = async (
  payload: UpdateSchedulingSettingsPayload,
): Promise<UpdateSchedulingSettingsResultDto> => {
  const response = await apiRequest<UpdateSettingsResponse>(
    "/psychologist/scheduling/settings",
    {
      method: "PUT",
      body: payload,
    },
  );
  return keysToCamel<UpdateSettingsResponse>(response).result;
};

export const createPsychologistAppointmentApi = async (
  payload: CreateAppointmentPayload,
): Promise<PsychologistAppointmentDto> => {
  const response = await apiRequest<CreateAppointmentResponse>(
    "/psychologist/scheduling/appointments",
    {
      method: "POST",
      body: payload,
    },
  );
  return keysToCamel<CreateAppointmentResponse>(response).appointment;
};

export const movePsychologistAppointmentApi = async (
  appointmentId: string,
  payload: MoveAppointmentPayload,
): Promise<PsychologistAppointmentDto[]> => {
  const response = await apiRequest<MoveAppointmentsResponse>(
    `/psychologist/scheduling/appointments/${appointmentId}/move`,
    {
      method: "PATCH",
      body: payload,
    },
  );
  return keysToCamel<MoveAppointmentsResponse>(response).appointments;
};

export const deletePsychologistAppointmentApi = async (
  appointmentId: string,
): Promise<void> => {
  await apiRequest<void>(`/psychologist/scheduling/appointments/${appointmentId}`, {
    method: "DELETE",
  });
};
