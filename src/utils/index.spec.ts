import { describe, expect, it } from '@jest/globals';
import { ChangesetConventionalCommit } from '../types/index.js';
import {
  associateCommitsToConventionalCommitMessages,
  difference,
  getRepoRoot,
  gitFetch,
  isBreakingChange,
  isConventionalCommit,
} from '../utils/index.js';

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

describe('is-breaking-multiline', () => {
  it('correctly identifies a breaking change', () => {
    expect(
      isBreakingChange(
        ['feat!: a change', 'First paragraph description.', 'Second paragraph description.'].join('\n\n'),
      ),
    ).toEqual(true);
  });
  it('correctly identifies a breaking change with a scope', () => {
    expect(
      isBreakingChange(
        ['feat(scope)!: a change', 'First paragraph description.', 'Second paragraph description.'].join('\n\n'),
      ),
    ).toEqual(true);
  });
  // @see https://www.conventionalcommits.org/en/v1.0.0/#specification
  it('correctly identifies a breaking change with all caps BREAKING CHANGE in message footer without body', () => {
    expect(isBreakingChange(['feat(scope): a change', 'BREAKING CHANGE: vars now uppercase'].join('\n\n'))).toEqual(
      true,
    );
  });
  it('correctly identifies a breaking change with all caps BREAKING CHANGE in message footer', () => {
    expect(
      isBreakingChange(
        [
          'feat(scope): a change',
          'First paragraph description.',
          'Second paragraph description.',
          'BREAKING CHANGE: vars now uppercase',
        ].join('\n\n'),
      ),
    ).toEqual(true);
  });
  it('correctly identifies a non-breaking change', () => {
    expect(
      isBreakingChange(
        [
          'feat: a change',
          'First paragraph description.',
          'Second paragraph description.',
          'Reviewed-by: ZZZ\nRefs: #123',
        ].join('\n\n'),
      ),
    ).toEqual(false);
  });
});

describe('is-conventional-commit', () => {
  describe.each(['feat', 'fix', 'perf', 'revert', 'docs', 'style', 'chore', 'refactor', 'test', 'build', 'ci'])(
    'correctly identifies a %s conventional commit',
    (type: string) => {
      it('with subject only', () => {
        expect(isConventionalCommit(`${type}: a change`)).toEqual(true);
      });
      it('with subject and body', () => {
        expect(
          isConventionalCommit(
            [`${type}: a change`, 'First paragraph description.', 'Second paragraph description.'].join('\n\n'),
          ),
        ).toEqual(true);
      });
      it('with subject, body and footers', () => {
        expect(
          isConventionalCommit(
            [
              `${type}: a change`,
              'First paragraph description.',
              'Second paragraph description.',
              'Reviewed-by: ZZZ\nRefs: #123',
            ].join('\n\n'),
          ),
        ).toEqual(true);
      });
    },
  );
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

describe('difference', () => {
  const changesets = [
    {
      releases: [
        { name: 'changeset-cc-test-01', type: 'minor' },
        { name: 'changeset-cc-test-02', type: 'minor' },
      ],
      summary: 'feat: add cli helper and flags',
      packagesChanged: [
        {
          dir: '/z/merge-requests/changeset-conventional-commits/packages/test-01',
          relativeDir: 'packages/test-01',
          packageJson: {},
        },
        {
          dir: '/z/merge-requests/changeset-conventional-commits/packages/test-02',
          relativeDir: 'packages/test-02',
          packageJson: {},
        },
      ],
    },
    {
      releases: [{ name: 'changeset-cc-test-01', type: 'minor' }],
      summary: 'docs(changeset-cc-test-01): add update #2 and #3',
      packagesChanged: [
        {
          dir: '/z/merge-requests/changeset-conventional-commits/packages/test-01',
          relativeDir: 'packages/test-01',
          packageJson: {},
        },
      ],
    },
  ] as ChangesetConventionalCommit[];

  const currentChangesets = [
    {
      releases: [
        { name: 'changeset-cc-test-01', type: 'minor' },
        { name: 'changeset-cc-test-02', type: 'minor' },
      ],
      summary: 'feat: add cli helper and flags',
      packagesChanged: [
        {
          dir: '/z/merge-requests/changeset-conventional-commits/packages/test-01',
          relativeDir: 'packages/test-01',
          packageJson: {},
        },
        {
          dir: '/z/merge-requests/changeset-conventional-commits/packages/test-02',
          relativeDir: 'packages/test-02',
          packageJson: {},
        },
      ],
    },
  ] as ChangesetConventionalCommit[];

  it('correctly detects equal changesets *without* trailing new line/line break within `summary`', () => {
    expect(difference(changesets, currentChangesets)).toEqual([changesets[1]]);
  });

  it('correctly detects equal changesets *with* trailing new line/line break within `summary`', () => {
    changesets[0].summary += '\n';
    expect(difference(changesets, currentChangesets)).toEqual([changesets[1]]);
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
