"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";

import type { PsychologistAppointmentDto, SchedulingConflictPreviewDto } from "@api";
import { Button, Flex, Icon, Title } from "@atoms";
import { formatDateAsDDMMYYYYAndTime, localeForAppLanguage } from "@helpers";
import { translateTemplate, useI18n } from "@i18n";
import { Card, ConfirmModal, PageLoader } from "@molecules";
import { AppShell, DashboardSectionTitle } from "@templates";
import {
  combineLocalDateAndTime,
  getWeekDateKeys,
  getWeekStartIso,
  shiftWeekStartIso,
  usePsychologistScheduling,
} from "@services";

import { SchedulingAppointmentModal } from "./scheduling/SchedulingAppointmentModal";
import { SchedulingCreateAppointmentModal } from "./scheduling/SchedulingCreateAppointmentModal";
import { SchedulingPatientContactModal } from "./scheduling/SchedulingPatientContactModal";
import { SchedulingSettingsModal } from "./scheduling/SchedulingSettingsModal";
import { SchedulingWeekGrid } from "./scheduling/SchedulingWeekGrid";
import { usePsychologistGuard } from "./usePsychologistGuard";

export const PsychologistSchedulingPage = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();
  const [weekStart, setWeekStart] = useState(() => getWeekStartIso());
  const {
    week,
    tzOffset,
    loading,
    saving,
    movingAppointmentId,
    error,
    saveSettings,
    createAppointment,
    moveAppointment,
    removeAppointment,
  } = usePsychologistScheduling(weekStart);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contactAppointment, setContactAppointment] =
    useState<PsychologistAppointmentDto | null>(null);
  const [editAppointment, setEditAppointment] = useState<PsychologistAppointmentDto | null>(
    null,
  );
  const [createSlot, setCreateSlot] = useState<{ dateKey: string; time: string } | null>(
    null,
  );
  const [pendingSettings, setPendingSettings] = useState<{
    sessionDurationMinutes: number;
    dayStartTime: string;
    dayEndTime: string;
    breakIntervals: { startTime: string; endTime: string }[];
  } | null>(null);
  const [settingsConflicts, setSettingsConflicts] = useState<
    SchedulingConflictPreviewDto[]
  >([]);

  const weekLabel = useMemo(() => {
    if (!week) {
      return "";
    }
    const dateKeys = getWeekDateKeys(week.weekStart, tzOffset);
    const first = dateKeys[0];
    const last = dateKeys[dateKeys.length - 1];
    const formatter = new Intl.DateTimeFormat(localeForAppLanguage(language), {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    const [fy, fm, fd] = first.split("-").map((part) => Number(part));
    const [ly, lm, ld] = last.split("-").map((part) => Number(part));
    return `${formatter.format(new Date(Date.UTC(fy, fm - 1, fd)))} – ${formatter.format(new Date(Date.UTC(ly, lm - 1, ld)))}`;
  }, [language, tzOffset, week]);

  const handleSaveSettings = useCallback(
    async (payload: {
      sessionDurationMinutes: number;
      dayStartTime: string;
      dayEndTime: string;
      breakIntervals: { startTime: string; endTime: string }[];
    }) => {
      const result = await saveSettings(payload);
      if (result.status === "confirmation_required") {
        setPendingSettings(payload);
        setSettingsConflicts(result.conflicts);
        return;
      }
      setSettingsOpen(false);
      setPendingSettings(null);
      setSettingsConflicts([]);
    },
    [saveSettings],
  );

  const handleConfirmSettingsConflicts = useCallback(async () => {
    if (!pendingSettings) {
      return;
    }
    const result = await saveSettings(pendingSettings, true);
    if (result.status === "saved") {
      setSettingsOpen(false);
      setPendingSettings(null);
      setSettingsConflicts([]);
    }
  }, [pendingSettings, saveSettings]);

  const handleMoveAppointment = useCallback(
    async (appointmentId: string, startsAt: string) => {
      const newWeekStart = await moveAppointment(appointmentId, startsAt);
      if (newWeekStart && newWeekStart !== weekStart) {
        setWeekStart(newWeekStart);
      }
    },
    [moveAppointment, weekStart],
  );

  const conflictMessage = useMemo(() => {
    if (!settingsConflicts.length) {
      return "";
    }
    const lines = settingsConflicts.map((conflict) => {
      const name =
        conflict.patientFullName?.trim() || t("PSYCHOLOGIST_SCHEDULING_UNKNOWN_PATIENT");
      const when = formatDateAsDDMMYYYYAndTime(conflict.startsAt);
      return translateTemplate(t("PSYCHOLOGIST_SCHEDULING_CONFLICT_LINE"), {
        name,
        when,
      });
    });
    return `${t("PSYCHOLOGIST_SCHEDULING_CONFLICT_MESSAGE")}\n\n${lines.join("\n")}`;
  }, [settingsConflicts, t]);

  if (!isPsychologist && !guardLoading) {
    return null;
  }

  const showFullPageLoader = guardLoading || (loading && !week);
  const showContentLoader = !showFullPageLoader && loading && week !== null;

  return (
    <AppShell
      title={t("PSYCHOLOGIST_SCHEDULING_TITLE")}
      subtitle={t("PSYCHOLOGIST_SCHEDULING_SUBTITLE")}
      variant="dashboard"
    >
      <Flex row wFull alignCenter justifySpaceBetween gap4 wrap>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          {t("BACK")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          outlined
          onClick={() => setSettingsOpen(true)}
          clickable={!saving}
        >
          <Icon.Cog sm white />
          <span className="ml-2">{t("PSYCHOLOGIST_SCHEDULING_SETTINGS_BUTTON")}</span>
        </Button>
      </Flex>

      {showFullPageLoader ? (
        <PageLoader />
      ) : (
        <>
          {error ? (
            <Title s1 gray>
              {error}
            </Title>
          ) : null}

          {showContentLoader ? (
            <PageLoader />
          ) : week ? (
            <Card padding="lg" shadow="md">
              <Flex col wFull gap5>
                <DashboardSectionTitle
                  title={translateTemplate(t("PSYCHOLOGIST_SCHEDULING_WEEK_TITLE"), {
                    week: weekLabel,
                  })}
                  tooltip={t("PSYCHOLOGIST_SCHEDULING_WEEK_TOOLTIP")}
                  trailing={
                    <Flex row gap2 alignCenter>
                      <Button
                        type="button"
                        variant="secondary"
                        outlined
                        circle
                        clickable={!loading && !saving}
                        title={t("PSYCHOLOGIST_SCHEDULING_PREV_WEEK")}
                        onClick={() =>
                          setWeekStart((current) => shiftWeekStartIso(current, -1, tzOffset))
                        }
                      >
                        <Icon.LeftOpen sm white />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        outlined
                        clickable={!loading && !saving}
                        onClick={() => setWeekStart(getWeekStartIso(new Date(), tzOffset))}
                      >
                        {t("PSYCHOLOGIST_SCHEDULING_CURRENT_WEEK")}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        outlined
                        circle
                        clickable={!loading && !saving}
                        title={t("PSYCHOLOGIST_SCHEDULING_NEXT_WEEK")}
                        onClick={() =>
                          setWeekStart((current) => shiftWeekStartIso(current, 1, tzOffset))
                        }
                      >
                        <Icon.RightOpen sm white />
                      </Button>
                    </Flex>
                  }
                />

                <SchedulingWeekGrid
                  weekStart={week.weekStart}
                  slotTimes={week.slotTimes}
                  appointments={week.appointments}
                  tzOffset={tzOffset}
                  saving={saving}
                  movingAppointmentId={movingAppointmentId}
                  onSlotClick={(dateKey, time) => setCreateSlot({ dateKey, time })}
                  onMoveAppointment={handleMoveAppointment}
                  onOpenContact={setContactAppointment}
                  onOpenAppointment={setEditAppointment}
                />
              </Flex>
            </Card>
          ) : null}
        </>
      )}

      <SchedulingSettingsModal
        visible={settingsOpen}
        settings={week?.settings ?? null}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setSettingsOpen(false);
          }
        }}
        onSave={handleSaveSettings}
      />

      <SchedulingPatientContactModal
        visible={Boolean(contactAppointment)}
        appointment={contactAppointment}
        onClose={() => setContactAppointment(null)}
      />

      <SchedulingAppointmentModal
        visible={Boolean(editAppointment)}
        appointment={editAppointment}
        weekStart={week?.weekStart ?? weekStart}
        slotTimes={week?.slotTimes ?? []}
        tzOffset={tzOffset}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setEditAppointment(null);
          }
        }}
        onSave={async (startsAt) => {
          if (!editAppointment) {
            return;
          }
          await handleMoveAppointment(editAppointment.id, startsAt);
          setEditAppointment(null);
        }}
        onDelete={async () => {
          if (!editAppointment) {
            return;
          }
          await removeAppointment(editAppointment.id);
          setEditAppointment(null);
        }}
      />

      <SchedulingCreateAppointmentModal
        visible={Boolean(createSlot)}
        dateKey={createSlot?.dateKey ?? null}
        time={createSlot?.time ?? null}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setCreateSlot(null);
          }
        }}
        onConfirm={async (patientId) => {
          if (!createSlot) {
            return;
          }
          const startsAt = combineLocalDateAndTime(
            createSlot.dateKey,
            createSlot.time,
            tzOffset,
          ).toISOString();
          await createAppointment({ patientId, startsAt });
          setCreateSlot(null);
        }}
      />

      <ConfirmModal
        visible={settingsConflicts.length > 0}
        title={t("PSYCHOLOGIST_SCHEDULING_CONFLICT_TITLE")}
        message={conflictMessage}
        confirmLabel={t("PSYCHOLOGIST_SCHEDULING_CONFLICT_CONFIRM")}
        cancelLabel={t("PSYCHOLOGIST_PATIENTS_MODAL_CANCEL")}
        confirmVariant="danger"
        onClose={() => {
          if (!saving) {
            setSettingsConflicts([]);
            setPendingSettings(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmSettingsConflicts();
        }}
      />
    </AppShell>
  );
};
