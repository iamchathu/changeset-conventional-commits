import { describe, expect, it } from '@jest/globals';
import {
  associateCommitsToConventionalCommitMessages,
  getRepoRoot,
  gitFetch,
  isBreakingChange,
  isConventionalCommit,
} from '../utils';

describe('is-breaking', () => {
  it('correctly identifies a breaking change', () => {
    expect(isBreakingChange('feat!: a change')).toEqual(true);
  });
  it('correctly identifies a breaking change with a scope', () => {
    expect(isBreakingChange('feat(scope)!: a change')).toEqual(true);
  });
  it('correctly identifies a breaking change with all caps BREAKING CHANGE', () => {
    expect(isBreakingChange('feat(scope): BREAKING CHANGE:')).toEqual(true);
  });
  it('correctly identifies a non-breaking change', () => {
    expect(isBreakingChange('feat: a change')).toEqual(false);
  });
});

describe('is-conventional-commit', () => {
  it('correctly identifies a feature conventional commit', () => {
    expect(isConventionalCommit('feat: a change')).toEqual(true);
  });
  it('correctly identifies a fix conventional commit', () => {
    expect(isConventionalCommit('fix: a change')).toEqual(true);
  });
  it('correctly identifies a perf conventional commit', () => {
    expect(isConventionalCommit('perf: a change')).toEqual(true);
  });
  it('correctly identifies a revert conventional commit', () => {
    expect(isConventionalCommit('revert: a change')).toEqual(true);
  });
  it('correctly identifies a docs conventional commit', () => {
    expect(isConventionalCommit('docs: a change')).toEqual(true);
  });
  it('correctly identifies a style conventional commit', () => {
    expect(isConventionalCommit('style: a change')).toEqual(true);
  });
  it('correctly identifies a chore conventional commit', () => {
    expect(isConventionalCommit('chore: a change')).toEqual(true);
  });
  it('correctly identifies a refactor conventional commit', () => {
    expect(isConventionalCommit('refactor: a change')).toEqual(true);
  });
  it('correctly identifies a test conventional commit', () => {
    expect(isConventionalCommit('test: a change')).toEqual(true);
  });
  it('correctly identifies a build conventional commit', () => {
    expect(isConventionalCommit('build: a change')).toEqual(true);
  });
  it('correctly identifies a ci conventional commit', () => {
    expect(isConventionalCommit('ci: a change')).toEqual(true);
  });
  it('correctly identifies a non-conventional commit', () => {
    expect(isConventionalCommit('a change')).toEqual(false);
  });
});

describe('associate-commits-to-conventional-commit-messages', () => {
  it('correctly associates commits to conventional commit messages when only the last commit is conventional', () => {
    expect(
      associateCommitsToConventionalCommitMessages([
        {
          commitHash: 'hash1',
          commitMessage: 'a change',
        },
        {
          commitHash: 'hash2',
          commitMessage: 'feat: a change',
        },
      ]),
    ).toEqual([
      {
        changelogMessage: 'feat: a change',
        commitHashes: ['hash1', 'hash2'],
      },
    ]);
  });
  it('correctly associates commits to conventional commit messages when only the first commit is conventional', () => {
    expect(
      associateCommitsToConventionalCommitMessages([
        {
          commitHash: 'hash1',
          commitMessage: 'feat: a change',
        },
        {
          commitHash: 'hash2',
          commitMessage: 'a change',
        },
      ]),
    ).toEqual([
      {
        changelogMessage: 'feat: a change',
        commitHashes: ['hash1', 'hash2'],
      },
    ]);
  });
  it('correctly associates commits to conventional commit messages when only the middle commit is conventional', () => {
    expect(
      associateCommitsToConventionalCommitMessages([
        {
          commitHash: 'hash1',
          commitMessage: 'a change',
        },
        {
          commitHash: 'hash2',
          commitMessage: 'feat: a change',
        },
        {
          commitHash: 'hash3',
          commitMessage: 'a change',
        },
      ]),
    ).toEqual([
      {
        changelogMessage: 'feat: a change',
        commitHashes: ['hash1', 'hash2', 'hash3'],
      },
    ]);
  });
  it('correctly associates commits to conventional commit messages when there is a mix of conventional and non-conventional commits', () => {
    expect(
      associateCommitsToConventionalCommitMessages([
        {
          commitHash: 'hash1',
          commitMessage: 'a change',
        },
        {
          commitHash: 'hash2',
          commitMessage: 'feat: first change',
        },
        {
          commitHash: 'hash3',
          commitMessage: 'a change',
        },
        {
          commitHash: 'hash4',
          commitMessage: 'feat: second change',
        },
        {
          commitHash: 'hash5',
          commitMessage: 'a change',
        },
      ]),
    ).toEqual([
      {
        changelogMessage: 'feat: first change',
        commitHashes: ['hash1', 'hash2', 'hash3'],
      },
      {
        changelogMessage: 'feat: second change',
        commitHashes: ['hash4', 'hash5'],
      },
    ]);
  });
});

describe('get-repo-root', () => {
  it('correctly gets the repo root', () => {
    expect(getRepoRoot().endsWith('changeset-conventional-commits')).toBe(true);
  });
});

describe('git-fetch', () => {
  it('correctly fetches', () => {
    expect(() => gitFetch('master')).not.toThrow();
  });
});
