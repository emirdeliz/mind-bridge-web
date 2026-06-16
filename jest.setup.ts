import '@testing-library/jest-dom';

jest.mock('@i18n', () => ({
  translateTemplate: (
    template: string,
    params: Record<string, string | number>
  ) =>
    Object.entries(params).reduce(
      (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
      template
    ),
}));
