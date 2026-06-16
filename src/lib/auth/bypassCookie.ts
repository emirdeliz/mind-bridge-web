import type { SerializeOptions } from 'cookie';
import { serializeCookieHeader } from '@supabase/ssr';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { GetServerSidePropsContext } from 'next';

import type { UserAuthViewDto, UserRole } from '@api';
import { createBypassSession } from '../../services/auth/authBypass';

export const BYPASS_COOKIE_NAME = 'mindbridge-bypass';

export const readBypassRole = (
  cookies:
    | NextApiRequest['cookies']
    | GetServerSidePropsContext['req']['cookies']
): UserRole | null => {
  const value = cookies[BYPASS_COOKIE_NAME];
  if (value === 'patient' || value === 'psychologist') {
    return value;
  }
  return null;
};

export const setBypassCookie = (
  res: NextApiResponse | GetServerSidePropsContext['res'],
  role: UserRole
) => {
  const serialized = serializeCookieHeader(BYPASS_COOKIE_NAME, role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  } as SerializeOptions);
  const existing = res.getHeader('Set-Cookie');
  const previous = existing
    ? Array.isArray(existing)
      ? existing.map(String)
      : [String(existing)]
    : [];
  res.setHeader('Set-Cookie', [...previous, serialized]);
};

export const clearBypassCookie = (
  res: NextApiResponse | GetServerSidePropsContext['res']
) => {
  const serialized = serializeCookieHeader(BYPASS_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  } as SerializeOptions);
  const existing = res.getHeader('Set-Cookie');
  const previous = existing
    ? Array.isArray(existing)
      ? existing.map(String)
      : [String(existing)]
    : [];
  res.setHeader('Set-Cookie', [...previous, serialized]);
};

export const getBypassSession = (
  cookies:
    | NextApiRequest['cookies']
    | GetServerSidePropsContext['req']['cookies']
): UserAuthViewDto | null => {
  const role = readBypassRole(cookies);
  if (!role) {
    return null;
  }
  return createBypassSession(role);
};
