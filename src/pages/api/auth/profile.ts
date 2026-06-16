import type { NextApiRequest, NextApiResponse } from 'next';

import type { UserProfile } from '@api';
import {
  badRequest,
  methodNotAllowed,
  readJsonBody,
  unauthorized,
} from '@lib/auth/apiAuth';
import { buildUserAuthView, toPublicSession } from '@lib/auth/buildSession';
import { createSupabaseServerClient } from '@lib/supabase/cookieMethods';
import { isServerAuthBypassEnabled } from '@lib/supabase/env';
import { getServerSession } from '@lib/auth/session.server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return methodNotAllowed(res);
  }

  const sessionResult = await getServerSession(req, res);
  if (!sessionResult) {
    return unauthorized(res);
  }

  const profile = await readJsonBody<UserProfile>(req);
  if (!profile) {
    return badRequest(res, 'Profile is required');
  }

  if (isServerAuthBypassEnabled() && !sessionResult.accessToken) {
    const updated = {
      ...sessionResult.user,
      profile: { ...profile },
    };
    return res.status(200).json({ session: updated });
  }

  if (!sessionResult.accessToken) {
    return unauthorized(res);
  }

  const supabase = createSupabaseServerClient(req, res);
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: profile.fullName,
      age: profile.age,
      address: profile.address,
      phone: profile.phone,
      language: profile.language ?? 'pt',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionResult.user.id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const refreshed = await buildUserAuthView(
    supabase,
    sessionResult.accessToken
  );
  if (!refreshed) {
    return unauthorized(res);
  }

  return res.status(200).json({ session: toPublicSession(refreshed) });
}
