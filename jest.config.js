module.exports = {
  testRegex: 'test.ts',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  preset: 'ts-jest',
  testMatch: null,
  roots: ['<rootDir>packages'],
  modulePathIgnorePatterns: ['lib', '.rpt2_cache'],
  moduleNameMapper: {
    '@redux-ts-starter-kit/(.+)$': '<rootDir>packages/$1/src',
  },
};
