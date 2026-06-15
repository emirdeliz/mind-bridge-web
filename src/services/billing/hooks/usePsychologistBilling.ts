import { useCallback, useEffect, useRef, useState } from "react";

import type { PsychologistBillingSummaryDto } from "@api";
import { getPsychologistBillingApi, ApiError } from "@api";
import { shouldSilentReload, type ReloadOptions } from "@helpers";
import { useAuth } from "@services";

export const usePsychologistBilling = (billingMonth?: string | null) => {
  const { session } = useAuth();
  const [billing, setBilling] = useState<PsychologistBillingSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const billingRef = useRef(billing);
  billingRef.current = billing;

  const load = useCallback(
    async (options?: ReloadOptions) => {
      if (!session || session.role !== "psychologist") {
        setBilling(null);
        setLoading(false);
        return;
      }

      const silent = shouldSilentReload(options, billingRef.current !== null);
      if (!silent) {
        setLoading(true);
      }
      setError("");

      try {
        const data = await getPsychologistBillingApi(billingMonth ?? undefined);
        setBilling(data);
      } catch (loadError) {
        setBilling(null);
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : loadError instanceof Error
              ? loadError.message
              : "Failed to load billing",
        );
      } finally {
        setLoading(false);
      }
    },
    [billingMonth, session],
  );

  useEffect(() => {
    void load({ silent: false });
  }, [load]);

  return { billing, loading, error, reload: load };
};
