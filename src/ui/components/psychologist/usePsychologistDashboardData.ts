import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  getDashboardChannelTotal,
  loadPsychologistDashboardSnapshot,
  type PsychologistDashboardSnapshot,
} from "./psychologistDashboardSnapshot";

export const usePsychologistDashboardData = () => {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<PsychologistDashboardSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(loadPsychologistDashboardSnapshot());
  }, [router.asPath, router.query.refreshed]);

  const resolved = snapshot ?? loadPsychologistDashboardSnapshot();

  return {
    snapshot: resolved,
    channelCenterText: String(getDashboardChannelTotal(resolved)),
    lastUpdatedAt: resolved.lastUpdatedAt,
  };
};
