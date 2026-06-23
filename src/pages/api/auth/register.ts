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
import { getApiBaseUrl, isServerAuthBypassEnabled } from '@lib/supabase/env';
import { createBypassSession } from '@services';

const registerPatientViaBackend = async (
  payload: UserAuthSaveOrUpdateDto
): Promise<{ ok: boolean; error?: string; status?: number }> => {
  const password = payload.password?.trim();
  const inviteCode = payload.inviteCode?.trim();
  const fullName = payload.fullName?.trim();

  if (!password) {
    return { ok: false, error: 'Password is required', status: 400 };
  }

  if (!fullName) {
    return { ok: false, error: 'Full name is required', status: 400 };
  }

  const apiBase = getApiBaseUrl();
  let response: Response;

  try {
    response = await fetch(`${apiBase}/auth/register-patient`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email.trim(),
        password,
        phone: phoneDigits(payload.phone),
        fullName,
        ...(inviteCode ? { inviteCode } : {}),
      }),
    });
  } catch {
    return {
      ok: false,
      error: `API indisponível em ${apiBase}. Inicie o mind-bridge-be.`,
      status: 503,
    };
  }

  const body = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    return {
      ok: false,
      error: body.error ?? 'Registration failed',
      status: response.status,
    };
  }

  return { ok: true };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  const payload = await readJsonBody<UserAuthSaveOrUpdateDto>(req);
  if (!payload?.email || !payload.role) {
    return badRequest(res, 'Invalid registration payload');
  }

  if (payload.role !== 'psychologist' && payload.role !== 'patient') {
    return badRequest(res, 'Invalid registration role');
  }

  if (isServerAuthBypassEnabled()) {
    setBypassCookie(res, payload.role);
    return res.status(200).json({ session: createBypassSession(payload.role) });
  }

  if (payload.role === 'patient') {
    const result = await registerPatientViaBackend(payload);
    if (!result.ok) {
      return res.status(result.status ?? 400).json({ error: result.error });
    }
    return res.status(200).json({ ok: true });
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
    return res
      .status(400)
      .json({ error: error?.message ?? 'Registration failed' });
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
