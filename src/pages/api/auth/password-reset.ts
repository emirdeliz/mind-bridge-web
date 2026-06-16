import type { NextApiRequest, NextApiResponse } from 'next';

import { badRequest, methodNotAllowed, readJsonBody } from '@lib/auth/apiAuth';
import { createSupabaseServerClient } from '@lib/supabase/cookieMethods';
import { isServerAuthBypassEnabled } from '@lib/supabase/env';

type ResetBody = { email?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  const body = await readJsonBody<ResetBody>(req);
  const email = body?.email?.trim();

  if (!email) {
    return badRequest(res, 'Email is required');
  }

  if (isServerAuthBypassEnabled()) {
    return res.status(400).json({
      ok: false,
      message: 'Password reset is not available in demo mode',
    });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const supabase = createSupabaseServerClient(req, res);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin.replace(/\/$/, '')}/`,
  });

  if (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }

  return res.status(200).json({ ok: true });
}
