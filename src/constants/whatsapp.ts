/** Digits only, with country code (e.g. 5511999999999). Exposed to the client. */
export const WHATSAPP_SUPPORT_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER ?? ''
).replace(/\D/g, '');

export const buildWhatsAppSupportUrl = (message?: string): string | null => {
  if (!WHATSAPP_SUPPORT_NUMBER) {
    return null;
  }

  const url = new URL(`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`);
  const trimmed = message?.trim();
  if (trimmed) {
    url.searchParams.set('text', trimmed);
  }

  return url.toString();
};
