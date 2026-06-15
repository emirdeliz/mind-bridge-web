import type { NextApiRequest, NextApiResponse } from 'next';

import { getApiBaseUrl } from '@lib/supabase/env';
import { getServerSession } from '@lib/auth/session.server';
import { resolveKnowledgeMaxFileBytes } from '@helpers';

// Next.js requires a static literal for page config. Runtime limit: KNOWLEDGE_MAX_FILE_BYTES.
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '10mb',
  },
};

const maxFileBytes = resolveKnowledgeMaxFileBytes(process.env.KNOWLEDGE_MAX_FILE_BYTES);

const readRequestBody = async (req: NextApiRequest): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sessionResult = await getServerSession(req, res);
  if (!sessionResult?.accessToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const apiBase = getApiBaseUrl();
  const contentType = req.headers['content-type'];
  if (!contentType?.includes('multipart/form-data')) {
    res.status(400).json({ error: 'Expected multipart/form-data upload' });
    return;
  }

  const body = await readRequestBody(req);
  if (body.byteLength > maxFileBytes) {
    res.status(400).json({
      error: `PDF exceeds maximum size of ${maxFileBytes} bytes`,
    });
    return;
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${sessionResult.accessToken}`,
    'Content-Type': contentType,
    'Content-Length': String(body.byteLength),
  };

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBase}/knowledge/documents`, {
      method: 'POST',
      headers,
      body: new Uint8Array(body),
    });
  } catch {
    res.status(503).json({
      error: `API indisponível em ${apiBase}. Inicie o mind-bridge-be (npm run dev na pasta do backend).`,
    });
    return;
  }

  const payload = await upstream.json().catch(() => ({}));
  res.status(upstream.status).json(payload);
}
