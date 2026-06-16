import type { NextApiRequest, NextApiResponse } from 'next';

import { methodNotAllowed } from '@lib/auth/apiAuth';
import { getServerSession } from '@lib/auth/session.server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  const sessionResult = await getServerSession(req, res);
  return res.status(200).json({ session: sessionResult?.user ?? null });
}
