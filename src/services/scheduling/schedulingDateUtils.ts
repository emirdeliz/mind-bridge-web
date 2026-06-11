import type { SchedulingBreakIntervalDto } from "@api";

export type SlotSettings = {
  sessionDurationMinutes: number;
  dayStartTime: string;
  dayEndTime: string;
  breakIntervals: SchedulingBreakIntervalDto[];
};

export const getBrowserTzOffsetMinutes = (): number => -new Date().getTimezoneOffset();

export const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
};

export const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatUtcDateKey = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const combineLocalDateAndTime = (
  dateKey: string,
  time: string,
  timeZoneOffsetMinutes: number,
): Date => {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  const utcMs =
    Date.UTC(year, month - 1, day, hours, minutes) + timeZoneOffsetMinutes * 60_000;
  return new Date(utcMs);
};

export const toLocalDateKey = (date: Date, timeZoneOffsetMinutes: number): string => {
  const local = new Date(date.getTime() - timeZoneOffsetMinutes * 60_000);
  return formatUtcDateKey(local);
};

export const toLocalTime = (date: Date, timeZoneOffsetMinutes: number): string => {
  const local = new Date(date.getTime() - timeZoneOffsetMinutes * 60_000);
  const hours = String(local.getUTCHours()).padStart(2, "0");
  const minutes = String(local.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getMondayDateKey = (reference: Date, timeZoneOffsetMinutes: number): string => {
  const dateKey = toLocalDateKey(reference, timeZoneOffsetMinutes);
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  const calendar = new Date(Date.UTC(year, month - 1, day));
  const daysFromMonday = (calendar.getUTCDay() + 6) % 7;
  calendar.setUTCDate(calendar.getUTCDate() - daysFromMonday);
  return formatUtcDateKey(calendar);
};

export const getWeekStartIso = (
  reference: Date = new Date(),
  timeZoneOffsetMinutes: number = getBrowserTzOffsetMinutes(),
): string => {
  const mondayKey = getMondayDateKey(reference, timeZoneOffsetMinutes);
  return combineLocalDateAndTime(mondayKey, "00:00", timeZoneOffsetMinutes).toISOString();
};

export const shiftWeekStartIso = (
  weekStartIso: string,
  weeks: number,
  timeZoneOffsetMinutes: number,
): string => {
  const startKey = toLocalDateKey(new Date(weekStartIso), timeZoneOffsetMinutes);
  const [year, month, day] = startKey.split("-").map((part) => Number(part));
  const next = new Date(Date.UTC(year, month - 1, day + weeks * 7));
  const nextKey = formatUtcDateKey(next);
  return combineLocalDateAndTime(nextKey, "00:00", timeZoneOffsetMinutes).toISOString();
};

export const getWeekDateKeys = (
  weekStartIso: string,
  timeZoneOffsetMinutes: number,
): string[] => {
  const startKey = toLocalDateKey(new Date(weekStartIso), timeZoneOffsetMinutes);
  const [year, month, day] = startKey.split("-").map((part) => Number(part));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day + index));
    return formatUtcDateKey(date);
  });
};

export const slotId = (dateKey: string, time: string): string => `slot|${dateKey}|${time}`;

export const appointmentDragId = (appointmentId: string): string =>
  `appointment|${appointmentId}`;

export const parseSlotId = (
  id: string,
): { dateKey: string; time: string } | null => {
  if (!id.startsWith("slot|")) {
    return null;
  }
  const [, dateKey, time] = id.split("|");
  if (!dateKey || !time) {
    return null;
  }
  return { dateKey, time };
};

export const parseAppointmentDragId = (id: string): string | null => {
  if (!id.startsWith("appointment|")) {
    return null;
  }
  return id.split("|")[1] ?? null;
};
