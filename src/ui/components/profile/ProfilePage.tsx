import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

import type { UserProfile, UserRole } from "@api";
import { linkPatientInviteCodeApi } from "@api";
import { Title } from "@atoms";
import { getRoleRoute, useAuth } from "@services";
import { useI18n } from "@i18n";
import { PageLoader } from "@molecules";
import { AppShell, ProfileForm } from "@templates";

interface ProfilePageProps {
  area: UserRole;
}

export const ProfilePage = ({ area }: ProfilePageProps) => {
  const router = useRouter();
  const { t, setLanguage } = useI18n();
  const { session, loading, saveProfile } = useAuth();
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void router.replace("/");
      return;
    }
    if (session.role !== area) {
      void router.replace(getRoleRoute(session.role));
    }
  }, [area, loading, session, router]);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      void router.back();
      return;
    }

    void router.replace(getRoleRoute(area));
  }, [area, router]);

  const handleSave = useCallback(
    async (profile: UserProfile, inviteCode?: string) => {
      setSaveError("");

      if (profile.language) {
        setLanguage(profile.language);
      }

      try {
        const updated = await saveProfile(profile);
        if (!updated) {
          return;
        }

        if (area === "patient" && inviteCode?.trim()) {
          await linkPatientInviteCodeApi(inviteCode);
        }
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : t("PROFILE_SAVE_ERROR")
        );
        return;
      }

      if (typeof window !== "undefined" && window.history.length > 1) {
        await router.back();
        return;
      }

      await router.replace(getRoleRoute(area));
    },
    [area, router, saveProfile, setLanguage, t],
  );

  const isAllowed = Boolean(session) && session?.role === area;
  if (!isAllowed && !loading) {
    return null;
  }

  return (
    <AppShell title={t("PROFILE_PAGE_TITLE")} subtitle={t("PROFILE_PAGE_SUBTITLE")} variant="dashboard">
      {loading || !isAllowed ? (
        <PageLoader />
      ) : (
        <>
      {saveError ? (
        <Title s2 error block mb4>
          {saveError}
        </Title>
      ) : null}
      <ProfileForm
        initialData={session.profile}
        onSave={handleSave}
        onBack={handleBack}
        showInviteCodeField={area === "patient"}
      />
        </>
      )}
    </AppShell>
  );
};
