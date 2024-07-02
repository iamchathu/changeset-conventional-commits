import type { Config } from 'jest';

const jestConfig: Config = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  cache: true,
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['text', 'cobertura'],
};

export default jestConfig;
