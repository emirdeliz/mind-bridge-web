"use client";

import { useCallback, useEffect, useState } from "react";

import type { AdminMetricsPeriod, AdminPlatformMetricsDto } from "@api";
import { getAdminPlatformMetricsApi } from "@api";

export const useAdminPlatformMetrics = (period: AdminMetricsPeriod) => {
  const [metrics, setMetrics] = useState<AdminPlatformMetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminPlatformMetricsApi(period);
      setMetrics(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load admin metrics",
      );
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { metrics, loading, error, reload };
};
