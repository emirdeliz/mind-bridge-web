import type { GetServerSidePropsContext } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';

import type { UserAuthViewDto } from '@api';

import { buildUserAuthView, toPublicSession } from './buildSession';
import { getBypassSession, readBypassRole } from './bypassCookie';
import { createSupabaseServerClient } from '../supabase/cookieMethods';
import { isServerAuthBypassEnabled } from '../supabase/env';

export type ServerSessionResult = {
  user: UserAuthViewDto;
  accessToken: string | null;
};

export const getServerSession = async (
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res']
): Promise<ServerSessionResult | null> => {
  if (isServerAuthBypassEnabled()) {
    const bypass = getBypassSession(req.cookies);
    if (bypass) {
      return { user: bypass, accessToken: null };
    }
  }

  const supabase = createSupabaseServerClient(req, res);
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    if (readBypassRole(req.cookies)) {
      return null;
    }
    return null;
  }

  const user = await buildUserAuthView(supabase, data.session.access_token);
  if (!user) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    user: toPublicSession(user),
    accessToken: data.session.access_token,
  };
};

export const getPublicSessionProps = (user: UserAuthViewDto | null) => ({
  auth: {
    session: user,
    loading: false,
  },
});
