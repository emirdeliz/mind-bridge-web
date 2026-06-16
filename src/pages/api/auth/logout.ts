import type { NextApiRequest, NextApiResponse } from 'next';

import { methodNotAllowed } from '@lib/auth/apiAuth';
import { clearBypassCookie } from '@lib/auth/bypassCookie';
import { createSupabaseServerClient } from '@lib/supabase/cookieMethods';
import { isServerAuthBypassEnabled } from '@lib/supabase/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  if (isServerAuthBypassEnabled()) {
    clearBypassCookie(res);
    res.status(204).end();
    return;
  }

  const supabase = createSupabaseServerClient(req, res);
  await supabase.auth.signOut();
  res.status(204).end();
}
