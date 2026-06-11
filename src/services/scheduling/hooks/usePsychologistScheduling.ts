import { useCallback, useEffect, useRef, useState } from "react";

import type {
  PsychologistAppointmentDto,
  PsychologistSchedulingWeekDto,
  SchedulingConflictPreviewDto,
  UpdateSchedulingSettingsResultDto,
} from "@api";
import {
  ApiError,
  createPsychologistAppointmentApi,
  deletePsychologistAppointmentApi,
  getPsychologistSchedulingWeekApi,
  movePsychologistAppointmentApi,
  updatePsychologistSchedulingSettingsApi,
  type CreateAppointmentInput,
  type UpdateSchedulingSettingsPayload,
} from "@api";
import { shouldSilentReload, type ReloadOptions } from "../../common/reloadOptions";
import { useAuth } from "@services";

import { getBrowserTzOffsetMinutes, getWeekStartIso } from "../schedulingDateUtils";
import { applyOptimisticMove, syncAppointmentsAfterMove } from "../schedulingOptimisticMove";

export const usePsychologistScheduling = (weekStart: string | null) => {
  const { session } = useAuth();
  const tzOffset = getBrowserTzOffsetMinutes();
  const [week, setWeek] = useState<PsychologistSchedulingWeekDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [movingAppointmentId, setMovingAppointmentId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const weekRef = useRef(week);
  weekRef.current = week;

  const load = useCallback(
    async (options?: ReloadOptions) => {
      if (!session || session.role !== "psychologist" || !weekStart) {
        setWeek(null);
        setLoading(false);
        return;
      }

      const silent = shouldSilentReload(options, weekRef.current !== null);
      if (!silent) {
        setLoading(true);
      }
      setError("");

      try {
        const data = await getPsychologistSchedulingWeekApi(weekStart, tzOffset);
        setWeek(data);
      } catch (loadError) {
        setWeek(null);
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : loadError instanceof Error
              ? loadError.message
              : "Failed to load scheduling",
        );
      } finally {
        setLoading(false);
      }
    },
    [session, tzOffset, weekStart],
  );

  useEffect(() => {
    void load({ silent: false });
  }, [load]);

  const saveSettings = useCallback(
    async (
      payload: Omit<UpdateSchedulingSettingsPayload, "tzOffset">,
      confirmRemoveConflicts = false,
    ): Promise<UpdateSchedulingSettingsResultDto> => {
      setSaving(true);
      setError("");
      try {
        const result = await updatePsychologistSchedulingSettingsApi({
          ...payload,
          confirmRemoveConflicts,
          tzOffset,
        });
        if (result.status === "saved") {
          await load({ silent: true });
        }
        return result;
      } catch (saveError) {
        setError(
          saveError instanceof ApiError
            ? saveError.message
            : saveError instanceof Error
              ? saveError.message
              : "Failed to save scheduling settings",
        );
        throw saveError;
      } finally {
        setSaving(false);
      }
    },
    [load, tzOffset],
  );

  const createAppointment = useCallback(
    async (payload: CreateAppointmentInput) => {
      if (!weekStart) {
        return;
      }
      setSaving(true);
      setError("");
      try {
        await createPsychologistAppointmentApi({
          ...payload,
          weekStart,
          tzOffset,
        });
        await load({ silent: true });
      } catch (createError) {
        setError(
          createError instanceof ApiError
            ? createError.message
            : createError instanceof Error
              ? createError.message
              : "Failed to create appointment",
        );
        throw createError;
      } finally {
        setSaving(false);
      }
    },
    [load, tzOffset, weekStart],
  );

  const moveAppointment = useCallback(
    async (appointmentId: string, startsAt: string) => {
      const currentWeek = weekRef.current;
      if (!currentWeek) {
        return;
      }

      const snapshot: PsychologistAppointmentDto[] = currentWeek.appointments.map((item) => ({
        ...item,
      }));
      const targetWeekStart = getWeekStartIso(new Date(startsAt), tzOffset);
      const optimisticAppointments = applyOptimisticMove(
        currentWeek.appointments,
        appointmentId,
        startsAt,
        currentWeek.slotTimes,
        tzOffset,
      );

      setWeek({
        ...currentWeek,
        appointments: optimisticAppointments,
      });
      setMovingAppointmentId(appointmentId);
      setError("");

      try {
        const updated = await movePsychologistAppointmentApi(appointmentId, {
          startsAt,
          weekStart: targetWeekStart,
          tzOffset,
        });

        if (targetWeekStart === weekStart) {
          setWeek((previous) => {
            if (!previous) {
              return previous;
            }
            return {
              ...previous,
              appointments: syncAppointmentsAfterMove(
                previous.appointments,
                updated,
                previous.weekStart,
                tzOffset,
              ),
            };
          });
        }

        return targetWeekStart;
      } catch (moveError) {
        setWeek((previous) => {
          if (!previous) {
            return previous;
          }
          return {
            ...previous,
            appointments: snapshot,
          };
        });
        setError(
          moveError instanceof ApiError
            ? moveError.message
            : moveError instanceof Error
              ? moveError.message
              : "Failed to move appointment",
        );
        throw moveError;
      } finally {
        setMovingAppointmentId(null);
      }
    },
    [tzOffset, weekStart],
  );

  const removeAppointment = useCallback(
    async (appointmentId: string) => {
      setSaving(true);
      setError("");
      try {
        await deletePsychologistAppointmentApi(appointmentId);
        await load({ silent: true });
      } catch (deleteError) {
        setError(
          deleteError instanceof ApiError
            ? deleteError.message
            : deleteError instanceof Error
              ? deleteError.message
              : "Failed to delete appointment",
        );
        throw deleteError;
      } finally {
        setSaving(false);
      }
    },
    [load],
  );

  return {
    week,
    tzOffset,
    loading,
    saving,
    movingAppointmentId,
    error,
    reload: load,
    saveSettings,
    createAppointment,
    moveAppointment,
    removeAppointment,
  };
};

export type { SchedulingConflictPreviewDto };
