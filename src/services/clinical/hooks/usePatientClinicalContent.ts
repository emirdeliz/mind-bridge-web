import { useCallback, useEffect, useState } from "react";

import type { PatientClinicalContentDto } from "@api";
import { getPatientClinicalContentApi } from "@api";
import { ApiError } from "@api/http/apiClient";
import { useI18n } from "@i18n";
import { useAuth } from "@services";
import { emptyClinicalContentForPatient } from "@services/clinical/clinicalContentDefaults";

export const usePatientClinicalContent = () => {
  const { language } = useI18n();
  const { session } = useAuth();
  const [content, setContent] = useState<PatientClinicalContentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!session) {
      setContent(null);
      setLoading(false);
      return;
    }

    if (!options?.silent) {
      setLoading(true);
    }
    setError("");

    try {
      const data = await getPatientClinicalContentApi(language);
      setContent(data);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 404 && session.id) {
        setContent(emptyClinicalContentForPatient(session.id));
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
  }, [session, language]);

  useEffect(() => {
    void load();
  }, [load]);

  return { content, loading, error, reload: load };
};
