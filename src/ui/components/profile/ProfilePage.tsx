import { useEffect } from "react";
import { useRouter } from "next/router";

import type { UserRole } from "@api";
import { getRoleRoute, useAuth } from "@services";
import { useI18n } from "@i18n";
import { AppShell, ProfileForm } from "@templates";

interface ProfilePageProps {
  area: UserRole;
}

export const ProfilePage = ({ area }: ProfilePageProps) => {
  const router = useRouter();
  const { t, setLanguage } = useI18n();
  const { session, loading, saveProfile } = useAuth();

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

  if (loading || !session || session.role !== area) {
    return null;
  }

  return (
    <AppShell title={t("PROFILE_PAGE_TITLE")} subtitle={t("PROFILE_PAGE_SUBTITLE")} variant="dashboard">
      <ProfileForm
        initialData={session.profile}
        onSave={(profile) => {
          if (profile.language) {
            setLanguage(profile.language);
          }
          void saveProfile(profile);
        }}
      />
    </AppShell>
  );
};
