module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@api$': '<rootDir>/src/api',
    '^@services$': '<rootDir>/src/services',
    '^@helpers$': '<rootDir>/src/helpers',
    '^@atoms$': '<rootDir>/src/ui/atoms',
    '^@molecules$': '<rootDir>/src/ui/molecules',
    '^@organisms$': '<rootDir>/src/ui/organisms',
    '^@components$': '<rootDir>/src/ui/components',
    '^@templates$': '<rootDir>/src/ui/templates',
    '^@i18n$': '<rootDir>/src/ui/system/i18n',
    '^@styles$': '<rootDir>/src/styles',
    '^@types$': '<rootDir>/src/types',
  },
};
