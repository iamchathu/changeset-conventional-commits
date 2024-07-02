import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { conventionalMessagesWithCommitsToChangesets } from './index';

// eslint-disable-next-line
import childProcess from 'child_process';
childProcess.execSync = jest.fn() as typeof childProcess.execSync;

type ExecSync = typeof childProcess.execSync;
const mockedExecSync = childProcess.execSync as jest.MockedFunction<ExecSync>;

const conventionalMessagesToCommits = [
  {
    commitHashes: ['hash1', 'hash2'],
    changelogMessage: 'feat: add new feature',
  },
  {
    commitHashes: ['hash3', 'hash4'],
    changelogMessage: 'fix: fix a bug',
  },
];

mockedExecSync.mockImplementation(((command: string) => {
  if (command.includes('git diff')) {
    if (command.includes('hash1') && command.includes('hash2')) return 'packages/package1/file1.ts\n';
    if (command.includes('hash3') && command.includes('hash4')) return 'packages/package2/file2.ts\n';
  } else if (command.includes('git rev-parse')) {
    return '/repo/root\n';
  }
  return '';
}) as ExecSync);

describe('conventionalMessagesWithCommitsToChangesets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return changesets with correct release types', () => {
    const options = {
      packages: [
        { dir: 'packages/package1', packageJson: { name: 'package1' } },
        { dir: 'packages/package2', packageJson: { name: 'package2' } },
      ],
    };

    const result = conventionalMessagesWithCommitsToChangesets(conventionalMessagesToCommits, options);

    expect(result).toEqual([
      {
        releases: [{ name: 'package1', type: 'minor' }],
        summary: 'feat: add new feature',
        packagesChanged: [{ dir: 'packages/package1', packageJson: { name: 'package1' } }],
      },
      {
        releases: [{ name: 'package2', type: 'patch' }],
        summary: 'fix: fix a bug',
        packagesChanged: [{ dir: 'packages/package2', packageJson: { name: 'package2' } }],
      },
    ]);
  });

  it('should return an empty array if changes are not in tracked projects', () => {
    const options = {
      packages: [{ dir: 'packages/package3', packageJson: { name: 'package1' } }],
    };

    const result = conventionalMessagesWithCommitsToChangesets(conventionalMessagesToCommits, options);

    expect(result).toEqual([]);
  });

  it('should filter out ignored file and skip release', () => {
    const options = {
      ignoredFiles: ['package1/(.*).ts'],
      packages: [
        { dir: 'packages/package1', packageJson: { name: 'package1' } },
        { dir: 'packages/package2', packageJson: { name: 'package2' } },
      ],
    };

    mockedExecSync.mockImplementation(((command: string) => {
      if (command.includes('git diff')) {
        if (command.includes('hash1') && command.includes('hash2')) return 'packages/package1/file1.ts\n';
        if (command.includes('hash3') && command.includes('hash4')) return 'packages/package2/file2.ts\n';
      } else if (command.includes('git rev-parse')) {
        return '/repo/root\n';
      }
      return '';
    }) as ExecSync);

    const result = conventionalMessagesWithCommitsToChangesets(conventionalMessagesToCommits, options);

    expect(result).toEqual([
      {
        releases: [{ name: 'package2', type: 'patch' }],
        summary: 'fix: fix a bug',
        packagesChanged: [{ dir: 'packages/package2', packageJson: { name: 'package2' } }],
      },
    ]);
  });

  it('should handle breaking changes', () => {
    const conventionalMessagesToCommits = [
      {
        commitHashes: ['hash1', 'hash2'],
        changelogMessage: 'feat: add new feature\nBREAKING CHANGE: something changed',
      },
      {
        commitHashes: ['hash3', 'hash4'],
        changelogMessage: 'fix!: fix a bug',
      },
    ];

    const options = {
      packages: [
        { dir: 'packages/package1', packageJson: { name: 'package1' } },
        { dir: 'packages/package2', packageJson: { name: 'package2' } },
      ],
    };

    const result = conventionalMessagesWithCommitsToChangesets(conventionalMessagesToCommits, options);

    expect(result).toEqual([
      {
        releases: [{ name: 'package1', type: 'major' }],
        summary: 'feat: add new feature\nBREAKING CHANGE: something changed',
        packagesChanged: [{ dir: 'packages/package1', packageJson: { name: 'package1' } }],
      },
      {
        releases: [{ name: 'package2', type: 'major' }],
        summary: 'fix!: fix a bug',
        packagesChanged: [{ dir: 'packages/package2', packageJson: { name: 'package2' } }],
      },
    ]);
  });

  it('should handle breaking changes with scope', () => {
    const conventionalMessagesToCommits = [
      {
        commitHashes: ['hash1', 'hash2'],
        changelogMessage: 'feat(scope): add new feature\nBREAKING CHANGE: something changed',
      },
      {
        commitHashes: ['hash3', 'hash4'],
        changelogMessage: 'fix(scope)!: fix a bug',
      },
    ];

    const options = {
      packages: [
        { dir: 'packages/package1', packageJson: { name: 'package1' } },
        { dir: 'packages/package2', packageJson: { name: 'package2' } },
      ],
    };

    const result = conventionalMessagesWithCommitsToChangesets(conventionalMessagesToCommits, options);

    expect(result).toEqual([
      {
        releases: [{ name: 'package1', type: 'major' }],
        summary: 'feat(scope): add new feature\nBREAKING CHANGE: something changed',
        packagesChanged: [{ dir: 'packages/package1', packageJson: { name: 'package1' } }],
      },
      {
        releases: [{ name: 'package2', type: 'major' }],
        summary: 'fix(scope)!: fix a bug',
        packagesChanged: [{ dir: 'packages/package2', packageJson: { name: 'package2' } }],
      },
    ]);
  });

  it('should return changesets with custom release rules based on config', () => {
    const conventionalMessagesToCommits = [
      {
        commitHashes: ['hash1', 'hash2'],
        changelogMessage: 'feat: update dependencies',
      },
      {
        commitHashes: ['hash3', 'hash4'],
        changelogMessage: 'docs: update documentation',
      },
    ];

    const options = {
      packages: [
        { dir: 'packages/package1', packageJson: { name: 'package1' } },
        { dir: 'packages/package2', packageJson: { name: 'package2' } },
      ],
      releaseRules: [
        { type: 'feat', release: undefined },
        { type: 'docs', release: 'major' as const },
      ],
    };

    const result = conventionalMessagesWithCommitsToChangesets(conventionalMessagesToCommits, options);

    expect(result).toEqual([
      {
        releases: [{ name: 'package2', type: 'major' }],
        summary: 'docs: update documentation',
        packagesChanged: [{ dir: 'packages/package2', packageJson: { name: 'package2' } }],
      },
    ]);
  });
});
