import { useCallback, useEffect, useState } from "react";

import type { PatientClinicalContentDto } from "@api";
import { getPsychologistPatientClinicalContentApi } from "@api";
import { ApiError } from "@api/http/apiClient";
import { useAuth } from "@services";
import { emptyClinicalContentForPatient } from "@services/clinical/clinicalContentDefaults";

export const usePsychologistClinicalContent = (patientId: string | undefined) => {
  const { session } = useAuth();
  const [content, setContent] = useState<PatientClinicalContentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!session || !patientId) {
      setContent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getPsychologistPatientClinicalContentApi(patientId);
      setContent(data);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 404) {
        setContent(emptyClinicalContentForPatient(patientId));
        setError("");
      } else {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load clinical content",
        );
        setContent(null);
      }
    } finally {
      setLoading(false);
    }
  }, [session, patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { content, loading, error, reload: load };
};
