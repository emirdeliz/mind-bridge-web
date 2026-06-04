import type { NextApiRequest, NextApiResponse } from 'next';

export const readJsonBody = async <T>(req: NextApiRequest): Promise<T | null> => {
  if (req.body && typeof req.body === 'object') {
    return req.body as T;
  }
  return null;
};

export const methodNotAllowed = (res: NextApiResponse) =>
  res.status(405).json({ error: 'Method not allowed' });

export const badRequest = (res: NextApiResponse, message: string) =>
  res.status(400).json({ error: message });

export const unauthorized = (res: NextApiResponse, message = 'Unauthorized') =>
  res.status(401).json({ error: message });
