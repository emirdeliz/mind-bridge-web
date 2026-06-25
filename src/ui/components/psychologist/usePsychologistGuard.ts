import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { getHomeRoute, getRoleRoute, useAuth } from '@services';

export const usePsychologistGuard = () => {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session?.role) {
      void router.replace('/');
      return;
    }
    if (session.isAdmin) {
      void router.replace('/admin');
      return;
    }
    if (session.role !== 'psychologist') {
      void router.replace(getRoleRoute(session.role));
    }
  }, [loading, session, router]);

  const isPsychologist = Boolean(session) && session?.role === 'psychologist';

  return { session, loading, isPsychologist };
};
