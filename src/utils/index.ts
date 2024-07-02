import type { Changeset } from '@changesets/types';
import { execSync } from 'child_process';
import type { ManyPkgPackage } from '../types';

interface Commit {
  commitHash: string;
  commitMessage: string;
}

interface ConventionalMessagesToCommits {
  changelogMessage: string;
  commitHashes: string[];
}

export interface ReleaseRule {
  breaking?: boolean;
  revert?: boolean;
  type?: string;
  release: 'major' | 'minor' | 'patch' | undefined;
}

/*
 * Copied from conventional commits config:
 * https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/writer-opts.js
 * "section" is currently unused but is left in, with the intent to update changeset changelog generation once more fleshed out
 */
const defaultCommitTypes = [
  { type: 'feat', section: 'Features' },
  { type: 'feature', section: 'Features' },
  { type: 'fix', section: 'Bug Fixes' },
  { type: 'perf', section: 'Performance Improvements' },
  { type: 'revert', section: 'Reverts' },
  { type: 'docs', section: 'Documentation' },
  { type: 'style', section: 'Styles' },
  { type: 'chore', section: 'Miscellaneous Chores' },
  { type: 'refactor', section: 'Code Refactoring' },
  { type: 'test', section: 'Tests' },
  { type: 'build', section: 'Build System' },
  { type: 'ci', section: 'Continuous Integration' },
];

/*
 * Based on rules of semantic-release:
 * https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js
 *
 */
const defaultReleaseRules: ReleaseRule[] = [
  { breaking: true as boolean, release: 'major' },
  { revert: true as boolean, release: 'patch' },
  { type: 'feat', release: 'minor' },
  { type: 'feature', release: 'minor' },
  { type: 'fix', release: 'patch' },
  { type: 'perf', release: 'patch' },
  { type: 'revert', release: 'patch' },
  { type: 'docs', release: 'patch' },
  { type: 'style', release: 'patch' },
  { type: 'chore', release: 'patch' },
  { type: 'refactor', release: 'patch' },
  { type: 'test', release: 'patch' },
  { type: 'build', release: 'patch' },
  { type: 'ci', release: 'patch' },
];

export const isBreakingChange = (commit: string) => {
  return (
    commit.includes('BREAKING CHANGE:') ||
    // eslint-disable-next-line no-useless-escape
    defaultCommitTypes.some((commitType) => commit.match(new RegExp(`^${commitType.type}(?:\(.*\))?!:`)))
  );
};

export const isRevertChange = (commit: string) => {
  return commit.startsWith('revert');
};

export const isConventionalCommit = (commit: string) => {
  // eslint-disable-next-line no-useless-escape
  return defaultCommitTypes.some((commitType) => commit.match(new RegExp(`^${commitType.type}(?:\(.*\))?!?:`)));
};

/* Attempts to associate non-conventional commits to the nearest conventional commit */
export const associateCommitsToConventionalCommitMessages = (commits: Commit[]): ConventionalMessagesToCommits[] => {
  return commits.reduce((acc, curr) => {
    if (!acc.length) {
      return [
        {
          changelogMessage: curr.commitMessage,
          commitHashes: [curr.commitHash],
        },
      ];
    }

    if (isConventionalCommit(curr.commitMessage)) {
      if (isConventionalCommit(acc[acc.length - 1].changelogMessage)) {
        return [
          ...acc,
          {
            changelogMessage: curr.commitMessage,
            commitHashes: [curr.commitHash],
          },
        ];
      } else {
        return [
          ...acc.slice(0, acc.length - 1),
          {
            changelogMessage: curr.commitMessage,
            commitHashes: [...acc[acc.length - 1].commitHashes, curr.commitHash],
          },
        ];
      }
    } else {
      return [
        ...acc.slice(0, acc.length - 1),
        {
          ...acc[acc.length - 1],
          commitHashes: [...acc[acc.length - 1].commitHashes, curr.commitHash],
        },
      ];
    }
  }, [] as ConventionalMessagesToCommits[]);
};

export const getFilesChangedSince = (opts: { from: string; to: string }) => {
  return execSync(`git diff --name-only ${opts.from}~1...${opts.to}`).toString().trim().split('\n');
};

export const getRepoRoot = () => {
  return execSync('git rev-parse --show-toplevel').toString().trim().replace(/\n|\r/g, '');
};

export function filterFiles(files: string[], ignoredPatterns: (string | RegExp)[]): string[] {
  return files.filter((file) => ignoredPatterns.every((pattern) => !file.match(pattern)));
}

export function getChangedPackages(filesChanged: string[], packages: ManyPkgPackage[]): ManyPkgPackage[] {
  const repoRoot = getRepoRoot();
  return packages.filter((pkg) => filesChanged.some((file) => file.match(pkg.dir.replace(`${repoRoot}/`, ''))));
}

function getCommitType(commitMessage: string) {
  const match = commitMessage.match(/^(\w+)(\(.+\))?(!)?:/);
  if (match) {
    return match[1];
  }
  return null;
}

type ReturnType = 'major' | 'minor' | 'patch' | undefined;
function determineReleaseType(changelogMessage: string, releaseRules = defaultReleaseRules): ReturnType {
  const commitType = getCommitType(changelogMessage);

  if (!commitType) {
    return;
  }

  for (const rule of releaseRules) {
    if (rule.breaking && isBreakingChange(changelogMessage)) {
      return rule.release;
    }
    if (rule.revert && isRevertChange(changelogMessage)) {
      return rule.release;
    }

    if (rule.type && rule.type === commitType) {
      return rule.release;
    }
  }
}

interface ConventionalMessagesWithCommitsToChangesetsOptions {
  ignoredFiles?: (string | RegExp)[];
  packages: ManyPkgPackage[];
  releaseRules?: ReleaseRule[];
}
export const conventionalMessagesWithCommitsToChangesets = (
  conventionalMessagesToCommits: ConventionalMessagesToCommits[],
  options: ConventionalMessagesWithCommitsToChangesetsOptions,
): Changeset[] => {
  const { ignoredFiles = [], packages, releaseRules } = options;

  return conventionalMessagesToCommits
    .map((entry) => {
      const filesChanged = filterFiles(
        getFilesChangedSince({
          from: entry.commitHashes[0],
          to: entry.commitHashes[entry.commitHashes.length - 1],
        }),
        ignoredFiles,
      );

      const packagesChanged = getChangedPackages(filesChanged, packages);

      if (packagesChanged.length === 0) return null;

      const releaseType = determineReleaseType(entry.changelogMessage, releaseRules);

      if (!releaseType) return null;

      const releases = packagesChanged.map((pkg) => ({
        name: pkg.packageJson.name,
        type: releaseType,
      }));

      return {
        releases,
        summary: entry.changelogMessage,
        packagesChanged,
      };
    })
    .filter(Boolean) as Changeset[];
};

export const gitFetch = (branch: string) => {
  execSync(`git fetch origin ${branch}`);
};

export const getCurrentBranch = () => {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
};

// This could be running on the main branch or on a branch that was created from the main branch.
// If this is running on the main branch, we want to get all commits since the last release.
// If this is running on a branch that was created from the main branch, we want to get all commits since the branch was created.
export const getCommitsSinceRef = (branch: string) => {
  gitFetch(branch);
  const currentBranch = getCurrentBranch();
  let sinceRef = `origin/${branch}`;
  if (currentBranch === branch) {
    try {
      sinceRef = execSync('git describe --tags --abbrev=0').toString();
    } catch (e) {
      console.log(
        "No git tags found, using repo's first commit for automated change detection. Note: this may take a while.",
      );
      sinceRef = execSync('git rev-list --max-parents=0 HEAD').toString();
    }
  }

  sinceRef = sinceRef.trim();

  return execSync(`git rev-list --ancestry-path ${sinceRef}...HEAD`).toString().split('\n').filter(Boolean).reverse();
};

const compareChangeSet = (a: Changeset, b: Changeset): boolean => {
  return a.summary.replace(/\n$/, '') === b.summary && JSON.stringify(a.releases) == JSON.stringify(b.releases);
};

export const difference = (a: Changeset[], b: Changeset[]): Changeset[] => {
  return a.filter((changeA) => !b.some((changeB) => compareChangeSet(changeA, changeB)));
};
