import type { Config } from 'jest';

const jestConfig: Config = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  cache: true,
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['text', 'cobertura'],
  // As by [SWC > Docs > @swc/jest > Q: Jest uses CommonJS by default. But I want to use ESM](https://swc.rs/docs/usage/jest#q-jest-uses-commonjs-by-default-but-i-want-to-use-esm)
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default jestConfig;
