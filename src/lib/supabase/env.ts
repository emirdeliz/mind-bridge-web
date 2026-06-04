export const getSupabaseUrl = (): string => {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    throw new Error('SUPABASE_URL is not configured');
  }
  return url;
};

export const getSupabaseAnonKey = (): string => {
  const key = process.env.SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('SUPABASE_ANON_KEY is not configured');
  }
  return key;
};

export const getApiBaseUrl = (): string => {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error('API_BASE_URL is not configured');
  }
  return baseUrl.replace(/\/$/, '');
};

export const isServerAuthBypassEnabled = (): boolean =>
  process.env.AUTH_BYPASS === 'true';
