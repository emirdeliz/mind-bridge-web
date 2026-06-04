import type { NextApiRequest, NextApiResponse } from 'next';

import type { UserAuthSaveOrUpdateDto } from '@api';
import { phoneDigits } from '@helpers';
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
import { createBypassSession } from '../../../services/auth/authBypass';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  const payload = await readJsonBody<UserAuthSaveOrUpdateDto>(req);
  if (!payload?.email || !payload.role) {
    return badRequest(res, 'Invalid registration payload');
  }

  if (payload.role !== 'psychologist') {
    return badRequest(
      res,
      'Only psychologists can register here. Patients are created by their psychologist.'
    );
  }

  if (isServerAuthBypassEnabled()) {
    setBypassCookie(res, 'psychologist');
    return res.status(200).json({ session: createBypassSession('psychologist') });
  }

  const password = payload.password?.trim();
  if (!password) {
    return badRequest(res, 'Password is required');
  }

  const normalizedPhone = phoneDigits(payload.phone);
  const supabase = createSupabaseServerClient(req, res);

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password,
    options: {
      data: { role: 'psychologist', phone: normalizedPhone },
    },
  });

  if (error || !data.session?.access_token || !data.user?.id) {
    return res.status(400).json({ error: error?.message ?? 'Registration failed' });
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      phone: normalizedPhone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.user.id);

  if (profileError) {
    return res.status(400).json({ error: profileError.message });
  }

  const session = await buildUserAuthView(supabase, data.session.access_token);
  if (!session) {
    await supabase.auth.signOut();
    return unauthorized(
      res,
      'Conta criada, mas o perfil não foi encontrado. Execute as migrations do Supabase.'
    );
  }

  return res.status(200).json({ session: toPublicSession(session) });
}
