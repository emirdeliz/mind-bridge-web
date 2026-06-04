import type { NextApiRequest, NextApiResponse } from 'next';

import { methodNotAllowed } from '@lib/auth/apiAuth';
import { clearBypassCookie } from '@lib/auth/bypassCookie';
import { createSupabaseServerClient } from '@lib/supabase/cookieMethods';
import { isServerAuthBypassEnabled } from '@lib/supabase/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  if (isServerAuthBypassEnabled()) {
    clearBypassCookie(res);
    return res.status(204).end();
  }

  const supabase = createSupabaseServerClient(req, res);
  await supabase.auth.signOut();
  return res.status(204).end();
}
