import { useCallback, useEffect, useRef, useState } from "react";

import { PatientClinicalContentDto, ApiError, getPatientClinicalContentApi } from "@api";
import { useI18n } from "@i18n";
import { shouldSilentReload, type ReloadOptions } from "../../common/reloadOptions";
import { useAuth } from "@services";
import { emptyClinicalContentForPatient } from "../clinicalContentDefaults";

export const usePatientClinicalContent = () => {
  const { language } = useI18n();
  const { session } = useAuth();
  const [content, setContent] = useState<PatientClinicalContentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const contentRef = useRef(content);
  contentRef.current = content;

  const load = useCallback(
    async (options?: ReloadOptions) => {
      if (!session) {
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
    },
    [session, language],
  );

  useEffect(() => {
    void load({ silent: false });
  }, [load]);

  return { content, loading, error, reload: load };
};
