import type { NextApiRequest, NextApiResponse } from 'next';

import type { UserRole } from '@api';
import {
  badRequest,
  methodNotAllowed,
  readJsonBody,
  unauthorized,
} from '@lib/auth/apiAuth';
import { setBypassCookie } from '@lib/auth/bypassCookie';
import { isServerAuthBypassEnabled } from '@lib/supabase/env';
import { createBypassSession } from '@services';

type BypassBody = { role?: UserRole };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  if (!isServerAuthBypassEnabled()) {
    return unauthorized(res, 'Bypass is disabled');
  }

  const body = await readJsonBody<BypassBody>(req);
  if (body?.role !== 'patient' && body?.role !== 'psychologist') {
    return badRequest(res, 'Invalid role');
  }

  setBypassCookie(res, body.role);
  return res.status(200).json({ session: createBypassSession(body.role) });
}
