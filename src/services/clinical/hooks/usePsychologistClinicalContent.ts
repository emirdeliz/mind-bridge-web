import { useCallback, useEffect, useRef, useState } from "react";

import type { PatientClinicalContentDto } from "@api";
import { getPsychologistPatientClinicalContentApi, ApiError } from "@api";
import { useI18n } from "@i18n";
import { shouldSilentReload, type ReloadOptions } from "../../common/reloadOptions";
import { useAuth } from "@services";
import { emptyClinicalContentForPatient } from "../clinicalContentDefaults";

export const usePsychologistClinicalContent = (patientId: string | undefined) => {
  const { language } = useI18n();
  const { session } = useAuth();
  const [content, setContent] = useState<PatientClinicalContentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const contentRef = useRef(content);
  contentRef.current = content;

  const load = useCallback(
    async (options?: ReloadOptions) => {
      if (!session || !patientId) {
        setContent(null);
        setLoading(false);
        return;
      }

      const silent = shouldSilentReload(options, contentRef.current !== null);
      if (!silent) {
        setLoading(true);
      }
      setError("");

      try {
        const data = await getPsychologistPatientClinicalContentApi(
          patientId,
          language,
        );
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
    },
    [session, patientId, language],
  );

  useEffect(() => {
    setContent(null);
    setLoading(true);
  }, [patientId]);

  useEffect(() => {
    void load({ silent: false });
  }, [load]);

  return { content, loading, error, reload: load };
};
