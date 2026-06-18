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

const hasJsonRequestBody = (req: NextApiRequest): boolean => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return false;
  }

  const raw = req.body;
  if (raw === undefined || raw === null || raw === '') {
    return false;
  }

  if (
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    Object.keys(raw).length === 0
  ) {
    return false;
  }

  return true;
};

const isConnectionError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }
  const cause = error.cause as { code?: string } | undefined;
  return (
    error.message.includes('fetch failed') ||
    cause?.code === 'ECONNREFUSED' ||
    cause?.code === 'ENOTFOUND'
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sessionResult = await getServerSession(req, res);

  if (!sessionResult?.accessToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const pathSegments = req.query.path;
  const segments = Array.isArray(pathSegments)
    ? pathSegments
    : pathSegments
      ? [pathSegments]
      : [];

  if (segments.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const targetPath = `/${segments.join('/')}`;
  const apiBase = getApiBaseUrl();
  const url = new URL(`${apiBase}${targetPath}`);

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
    Authorization: `Bearer ${sessionResult.accessToken}`,
  };

  const acceptHeader = req.headers.accept;
  if (typeof acceptHeader === 'string' && acceptHeader.trim()) {
    headers.Accept = acceptHeader;
  } else {
    headers.Accept = 'application/json';
  }

  let body: string | undefined;
  if (hasJsonRequestBody(req)) {
    headers['Content-Type'] = 'application/json';
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      method: req.method,
      headers,
      body,
    });
  } catch (error) {
    if (isConnectionError(error)) {
      res.status(503).json({
        error: `API indisponível em ${apiBase}. Inicie o mind-bridge-be (npm run dev na pasta do backend).`,
      });
      return;
    }
    throw error;
  }

  const contentType = upstream.headers.get('content-type') ?? '';
  res.status(upstream.status);

  if (upstream.status === 204) {
    res.end();
    return;
  }

  if (contentType.includes('text/event-stream')) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    if (!upstream.body) {
      res.end();
      return;
    }

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(Buffer.from(value));
    }
  }

  if (contentType.includes('application/json')) {
    const payload = await upstream.json().catch(() => ({}));
    res.json(payload);
    return;
  }

  const text = await upstream.text();
  res.send(text);
}
