module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1'
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['<rootDir>/src/tests/**/*.(test|spec).+(ts|tsx|js)'],
};