import { useEffect, useState } from "react";

import { usePsychologistClinicalContent } from "@services";

import {
  bumpDashboardSnapshot,
  emptyDashboardSnapshot,
  getDashboardChannelTotal,
  type PsychologistDashboardSnapshot,
} from "./psychologistDashboardSnapshot";

const DASHBOARD_BUMP_KEY = "mb.psychologist.dashboardBump";

export const usePsychologistDashboardData = (patientId: string | undefined) => {
  const { content, loading, error } = usePsychologistClinicalContent(patientId);
  const [snapshot, setSnapshot] = useState<PsychologistDashboardSnapshot | null>(null);

  useEffect(() => {
    if (!content?.dashboardSnapshot) {
      if (!loading) {
        setSnapshot(emptyDashboardSnapshot());
      }
      return;
    }

    let next = content.dashboardSnapshot;
    if (
      typeof window !== "undefined" &&
      patientId &&
      window.sessionStorage.getItem(DASHBOARD_BUMP_KEY) === patientId
    ) {
      next = bumpDashboardSnapshot(next);
      window.sessionStorage.removeItem(DASHBOARD_BUMP_KEY);
    }
    setSnapshot(next);
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
