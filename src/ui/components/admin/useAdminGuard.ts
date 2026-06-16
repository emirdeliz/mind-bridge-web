'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { getRoleRoute, useAuth } from '@services';

export const useAdminGuard = () => {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!session) {
      void router.replace('/');
      return;
    }
    if (!session.isAdmin) {
      void router.replace(getRoleRoute(session.role));
    }
  }, [loading, router, session]);

  return {
    loading,
    isAdmin: Boolean(session?.isAdmin),
  };
};
