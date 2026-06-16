import type { NextApiRequest, NextApiResponse } from 'next';
import type { GetServerSidePropsContext } from 'next';
import { createServerClient } from '@supabase/ssr';
import { serializeCookieHeader } from '@supabase/ssr';
import type { SerializeOptions } from 'cookie';

import { getSupabaseAnonKey, getSupabaseUrl } from './env';

type CookieToSet = { name: string; value: string; options: SerializeOptions };

const readRequestCookies = (
  cookies:
    | NextApiRequest['cookies']
    | GetServerSidePropsContext['req']['cookies']
) =>
  Object.entries(cookies).flatMap(([name, value]) => {
    if (value === undefined || value === '') {
      return [];
    }
    return [{ name, value: String(value) }];
  });

const appendSetCookie = (
  res: NextApiResponse | GetServerSidePropsContext['res'],
  cookiesToSet: CookieToSet[]
) => {
  if (cookiesToSet.length === 0) {
    return;
  }

  const serialized = cookiesToSet.map(({ name, value, options }) =>
    serializeCookieHeader(name, value, options)
  );
  const existing = res.getHeader('Set-Cookie');
  const previous = existing
    ? Array.isArray(existing)
      ? existing.map(String)
      : [String(existing)]
    : [];

  res.setHeader('Set-Cookie', [...previous, ...serialized]);
};

export const createSupabaseServerClient = (
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res']
) =>
  createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return readRequestCookies(req.cookies);
      },
      setAll(cookiesToSet: CookieToSet[]) {
        appendSetCookie(res, cookiesToSet);
      },
    },
  });
