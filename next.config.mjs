import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
);

/** @type {import("next").NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@atoms': new URL('./src/ui/atoms', import.meta.url).pathname,
      '@molecules': new URL('./src/ui/molecules', import.meta.url).pathname,
      '@organisms': new URL('./src/ui/organisms', import.meta.url).pathname,
      '@components': new URL('./src/ui/components', import.meta.url).pathname,
      '@templates': new URL('./src/ui/templates', import.meta.url).pathname,
      '@services': new URL('./src/services', import.meta.url).pathname,
      '@helpers': new URL('./src/helpers', import.meta.url).pathname,
      '@utils': new URL('./src/utils', import.meta.url).pathname,
      '@api': new URL('./src/api', import.meta.url).pathname,
      '@constants': new URL('./src/constants', import.meta.url).pathname,
      '@lib': new URL('./src/lib', import.meta.url).pathname,
      '@i18n': new URL('./src/ui/system/i18n', import.meta.url).pathname,
      '@styles': new URL('./src/styles', import.meta.url).pathname,
      '@types': new URL('./src/types', import.meta.url).pathname,
    };
    return config;
  },
};

export default nextConfig;
