"use client";

import { AppShell } from "@templates";
import { useI18n } from "@i18n";

import { PsychologistChatShortcutsSettingsPanel } from "./PsychologistChatShortcutsSettingsPanel";
import { usePsychologistGuard } from "./usePsychologistGuard";

export const PsychologistSettingsPage = () => {
  const { t } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();

  if (!isPsychologist && !guardLoading) {
    return null;
  }

  return (
    <AppShell
      title={t("PSYCHOLOGIST_SETTINGS_TITLE")}
      subtitle={t("PSYCHOLOGIST_SETTINGS_SUBTITLE")}
      variant="dashboard"
    >
      <PsychologistChatShortcutsSettingsPanel />
    </AppShell>
  );
};
