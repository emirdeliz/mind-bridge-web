import type { PsychologistAppointmentDto } from '@api';

import {
  combineLocalDateAndTime,
  getWeekDateKeys,
  toLocalDateKey,
  toLocalTime,
} from './schedulingDateUtils';

const atSlot = (
  appointment: PsychologistAppointmentDto,
  dateKey: string,
  time: string,
  tzOffset: number
): boolean =>
  toLocalDateKey(new Date(appointment.startsAt), tzOffset) === dateKey &&
  toLocalTime(new Date(appointment.startsAt), tzOffset) === time;

export const applyOptimisticMove = (
  appointments: PsychologistAppointmentDto[],
  appointmentId: string,
  startsAt: string,
  slotTimes: string[],
  tzOffset: number
): PsychologistAppointmentDto[] => {
  const moving = appointments.find((item) => item.id === appointmentId);
  if (!moving) {
    return appointments;
  }

  const dateKey = toLocalDateKey(new Date(startsAt), tzOffset);
  const time = toLocalTime(new Date(startsAt), tzOffset);
  const conflicting = appointments.find(
    (item) => item.id !== appointmentId && atSlot(item, dateKey, time, tzOffset)
  );

  let result = appointments.map((item) => ({ ...item }));

  const setStart = (id: string, start: string) => {
    result = result.map((item) =>
      item.id === id ? { ...item, startsAt: start } : item
    );
  };

  setStart(appointmentId, startsAt);

  if (conflicting) {
    const fromIndex = Math.max(
      0,
      slotTimes.findIndex((slot) => slot >= time)
    );
    const occupiedStarts = new Set(
      result
        .filter((item) => item.id !== conflicting.id)
        .map((item) => item.startsAt)
    );

    for (let index = fromIndex; index < slotTimes.length; index += 1) {
      const candidate = combineLocalDateAndTime(
        dateKey,
        slotTimes[index],
        tzOffset
      ).toISOString();
      if (!occupiedStarts.has(candidate)) {
        setStart(conflicting.id, candidate);
        break;
      }
    }
  }

  return result;
};

export const syncAppointmentsAfterMove = (
  current: PsychologistAppointmentDto[],
  updated: PsychologistAppointmentDto[],
  weekStart: string,
  tzOffset: number
): PsychologistAppointmentDto[] => {
  const weekDateKeys = new Set(getWeekDateKeys(weekStart, tzOffset));
  const byId = new Map(current.map((item) => [item.id, item]));

  for (const appointment of updated) {
    const dateKey = toLocalDateKey(new Date(appointment.startsAt), tzOffset);
    if (weekDateKeys.has(dateKey)) {
      byId.set(appointment.id, appointment);
    } else {
      byId.delete(appointment.id);
    }
  }

  return Array.from(byId.values());
};
