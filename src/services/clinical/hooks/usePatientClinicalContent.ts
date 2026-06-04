import { useCallback, useEffect, useState } from "react";

import type { PatientClinicalContentDto } from "@api";
import { getPatientClinicalContentApi } from "@api";
import { useAuth } from "@services";

export const usePatientClinicalContent = () => {
  const { session } = useAuth();
  const [content, setContent] = useState<PatientClinicalContentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!session) {
      setContent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getPatientClinicalContentApi();
      setContent(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load clinical content",
      );
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void load();
  }, [load]);

  return { content, loading, error, reload: load };
};
