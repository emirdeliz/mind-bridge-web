import { useEffect, useState } from "react";

import { usePsychologistClinicalContent } from "@services";

import {
  emptyDashboardSnapshot,
  getDashboardChannelTotal,
  type PsychologistDashboardSnapshot,
} from "./psychologistDashboardSnapshot";

export const usePsychologistDashboardData = (
  patientId: string | undefined,
  refreshKey?: string,
) => {
  const { content, loading, error, reload } = usePsychologistClinicalContent(patientId);
  const [snapshot, setSnapshot] = useState<PsychologistDashboardSnapshot | null>(null);

  useEffect(() => {
    if (refreshKey) {
      void reload();
    }
  }, [refreshKey, reload]);

  useEffect(() => {
    if (!content?.dashboardSnapshot) {
      if (!loading) {
        setSnapshot(emptyDashboardSnapshot());
      }
      return;
    }

    setSnapshot(content.dashboardSnapshot);
  }, [content, loading, patientId]);

  const resolved = snapshot ?? emptyDashboardSnapshot();

  return {
    snapshot: resolved,
    channelCenterText: String(getDashboardChannelTotal(resolved)),
    lastUpdatedAt: resolved.lastUpdatedAt,
    loading,
    error,
    setSnapshot,
  };
};
