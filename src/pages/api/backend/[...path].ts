import type { NextApiRequest, NextApiResponse } from 'next';

import { getApiBaseUrl } from '@lib/supabase/env';
import { getServerSession } from '@lib/auth/session.server';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionResult = await getServerSession(req, res);

  if (!sessionResult?.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const pathSegments = req.query.path;
  const segments = Array.isArray(pathSegments)
    ? pathSegments
    : pathSegments
      ? [pathSegments]
      : [];

  if (segments.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  const targetPath = `/${segments.join('/')}`;
  const url = new URL(`${getApiBaseUrl()}${targetPath}`);

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === 'path' || value === undefined) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => url.searchParams.append(key, String(entry)));
      return;
    }
    url.searchParams.set(key, String(value));
  });

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${sessionResult.accessToken}`,
  };

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  const upstream = await fetch(url.toString(), {
    method: req.method,
    headers,
    body,
  });

  const contentType = upstream.headers.get('content-type') ?? '';
  res.status(upstream.status);

  if (upstream.status === 204) {
    return res.end();
  }

  if (contentType.includes('application/json')) {
    const payload = await upstream.json().catch(() => ({}));
    return res.json(payload);
  }

  const text = await upstream.text();
  return res.send(text);
}
