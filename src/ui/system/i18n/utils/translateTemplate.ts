export const translateTemplate = (template: string, params: Record<string, string | number>): string =>
  Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  );
