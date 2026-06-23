import type { NextApiRequest, NextApiResponse } from 'next';

import {
  badRequest,
  methodNotAllowed,
  readJsonBody,
  unauthorized,
} from '@lib/auth/apiAuth';
import { buildUserAuthView, toPublicSession } from '@lib/auth/buildSession';
import { setBypassCookie } from '@lib/auth/bypassCookie';
import { createSupabaseServerClient } from '@lib/supabase/cookieMethods';
import { isServerAuthBypassEnabled } from '@lib/supabase/env';
import { createBypassSession } from '@services';

type LoginBody = {
  email?: string;
  password?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  const body = await readJsonBody<LoginBody>(req);
  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return badRequest(res, 'Email and password are required');
  }

  if (isServerAuthBypassEnabled()) {
    const role =
      email.includes('psicologo') || email.includes('psychologist')
        ? 'psychologist'
        : 'patient';
    setBypassCookie(res, role);
    return res.status(200).json({ session: createBypassSession(role) });
  }

  const supabase = createSupabaseServerClient(req, res);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    return unauthorized(res, error?.message ?? 'Invalid email or password');
  }

  const session = await buildUserAuthView(supabase, data.session.access_token);
  if (!session) {
    await supabase.auth.signOut();
    return unauthorized(
      res,
      'Perfil não encontrado. Verifique as migrations do Supabase ou contate o suporte.'
    );
  }

  return res.status(200).json({ session: toPublicSession(session) });
}
