"use client";

import { memo, useCallback } from "react";
import type { UrlObject } from "url";
import { useRouter } from "next/router";
import { Button, Icon } from "@atoms";
import { useI18n } from "@i18n";

const DASHBOARD_ASSESSMENT_PATH = "/dashboard-assessment";

export type PageBackButtonProps = {
  /**
   * `dashboard` — navega para o dashboard de assessment (fluxo CPG).
   * `history` — `router.back()` (útil quando o destino deve ser literalmente a página anterior).
   * `push` — `router.push(pushTo)`; se `pushTo` estiver ausente, equivale a `history`.
   */
  mode?: "dashboard" | "history" | "push";
  /** Usado com `mode="push"` (ex.: `/upcode/projects/[projectId]/audit`). */
  pushTo?: UrlObject;
  /** Se true, envolve o botão numa linha `flex w-full justify-start` (topo de página). */
  fullWidthRow?: boolean;
};

export const PageBackButton = memo(function PageBackButton({
  mode = "dashboard",
  pushTo,
  fullWidthRow = true,
}: PageBackButtonProps) {
  const { t } = useI18n();
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (mode === "history") {
      router.back();
      return;
    }
    if (mode === "push") {
      if (pushTo?.pathname) {
        void router.push(pushTo);
        return;
      }
      router.back();
      return;
    }
    void router.push(DASHBOARD_ASSESSMENT_PATH);
  }, [mode, pushTo, router]);

  const button = (
    <Button type="button" sm outlined variant="secondary" onClick={handleClick}>
      <Icon.ArrowBack xs m1 />
      {t("BACK")}
    </Button>
  );

  if (fullWidthRow) {
    return <div className="flex w-full justify-start">{button}</div>;
  }

  return button;
});

PageBackButton.displayName = "PageBackButton";
