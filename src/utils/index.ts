import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { info, log } from '@changesets/logger';
import type { Changeset, NewChangeset } from '@changesets/types';
import type {
  ChangesetConventionalCommitsConfig as Config,
  ChangesetConventionalCommits,
  Commit,
  CommitTypes,
  ConventionalMessagesToCommits,
  LogHeaderOptions,
  MeowOptions,
} from '../types/index.js';

/*
 * List of Commit Types from Conventional Commits/Changelog:
 * https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/writer-opts.js
 * "section" is currently unused but is left in, with the intent to update changeset changelog generation once more fleshed out
 */
export const defaultCommitTypes: CommitTypes[] = [
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
  // Added
  { type: 'devops', section: 'DevOps' },
  { type: 'examples', section: 'Examples' },
];

export const configDefault = (): Config => ({
  commitTypes: defaultCommitTypes,
});

export const configRead = (cwd: string, options: MeowOptions) => {
  const config = configDefault();

  if (!fs.existsSync(path.join(cwd, '.changeset', 'config-conventional.json'))) {
    logger(log, `   Config '.changeset/config-conventional.json' not found, using defaults`, options);
  } else {
    const configLocal: Config = fs.readJSONSync(path.join(cwd, '.changeset', 'config-conventional.json'));
    config.commitTypes = configLocal.commitTypes ?? config.commitTypes;
    logger(log, `   Config '.changeset/config-conventional.json' found and loaded`, options);
  }

  return config;
};

export const logHeader = (m: string, o?: LogHeaderOptions) => {
  o = { newline: true, lead: true, bold: true, ...o };

  return (o.newline ? '\n' : '') + (o.bold ? chalk.bold((o.lead ? ':: ' : '') + m) : (o.lead ? ':: ' : '') + m);
};

export const logger = <T>(logger: typeof log, m: T, options: MeowOptions) => {
  if (options.flags.verbosity !== false || logger !== log) {
    logger(m);
  }
};

export const changesetsSummaryFirstLine = (cs: Changeset[]) => {
  // Take first line only and remove possible backticks for better readability
  return cs.reduce(
    (s, c, i) => s + '   ' + c.summary.split('\n', 1)[0].replace(/(`|')/g, '') + (cs[i + 1] ? '\n' : ''),
    '',
  );
};

export const changesetsSummary = (cs: NewChangeset[]) => {
  // Take first line only and remove possible backticks for better readability
  return cs.reduce(
    (s, c, i) =>
      s +
      chalk.bold('   ' + c.summary.split('\n', 1)[0].replace(/(`|')/g, '')) +
      '\n' +
      `   ` +
      (c.id ? `${c.id}: ` : '') +
      `[` +
      c.releases.reduce((rs, r, ri) => rs + r.name + (c.releases[ri + 1] ? ', ' : cs[i + 1] ? ']\n' : ']'), '') +
      (cs[i + 1] ? '\n' : ''),
    '\n',
  );
};

export const isBreakingChange = (commit: string, config: Config) => {
  return (
    commit.includes('BREAKING CHANGE:') ||
    // eslint-disable-next-line no-useless-escape
    config.commitTypes.some((commitType) => commit.match(new RegExp(`^${commitType.type}(?:\(.*\))?!:`)))
  );
};

export const isConventionalCommit = (commit: string, config: Config) => {
  // eslint-disable-next-line no-useless-escape
  return config.commitTypes.some((commitType) => commit.match(new RegExp(`^${commitType.type}(?:\(.*\))?!?:`)));
};

/* Attempts to associate non-conventional commits to the nearest conventional commit */
export const associateCommitsToConventionalCommitMessages = (
  commits: Commit[],
  config: Config,
): ConventionalMessagesToCommits[] => {
  return commits.reduce((acc, curr) => {
    if (!acc.length) {
      return [
        {
          changelogMessage: curr.message,
          commitHashes: [curr.hash],
        },
      ];
    }

    if (isConventionalCommit(curr.message, config)) {
      if (isConventionalCommit(acc[acc.length - 1].changelogMessage, config)) {
        return [
          ...acc,
          {
            changelogMessage: curr.message,
            commitHashes: [curr.hash],
          },
        ];
      } else {
        return [
          ...acc.slice(0, acc.length - 1),
          {
            changelogMessage: curr.message,
            commitHashes: [...acc[acc.length - 1].commitHashes, curr.hash],
          },
        ];
      }
    } else {
      return [
        ...acc.slice(0, acc.length - 1),
        {
          ...acc[acc.length - 1],
          commitHashes: [...acc[acc.length - 1].commitHashes, curr.hash],
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

export const conventionalMessagesWithCommitsToChangesets = (
  conventionalMessagesToCommits: ConventionalMessagesToCommits[],
  changesetConventionalCommits: ChangesetConventionalCommits,
) => {
  const { config, ignoredFiles = [], packages } = changesetConventionalCommits;

  return (
    conventionalMessagesToCommits
      .map((entry) => {
        let filesChanged = getFilesChangedSince({
          from: entry.commitHashes[0],
          to: entry.commitHashes[entry.commitHashes.length - 1],
        }).filter((file) => {
          return ignoredFiles.every((ignoredPattern) => !file.match(ignoredPattern));
        });

        const packagesChanged = packages.filter((pkg) => {
          // We've to run through all files and remove matches, so they don't end up for the root-package (last).
          return filesChanged.filter((file) => {
            if (file.match(pkg.relativeDir)) {
              filesChanged = filesChanged.filter((fileFilter) => !file.match(fileFilter));
              return true;
            }
          }).length;
        });

        if (packagesChanged.length === 0) return null;

        return {
          releases: packagesChanged.map((pkg) => {
            return {
              name: pkg.packageJson.name,
              type: isBreakingChange(entry.changelogMessage, config)
                ? 'major'
                : entry.changelogMessage.startsWith('feat')
                  ? 'minor'
                  : 'patch',
            };
          }),
          summary: entry.changelogMessage,
          packagesChanged,
        };
      })
      .filter(Boolean) as Changeset[]
  );
};

export const gitFetch = (branch: string) => {
  execSync(`git fetch origin ${branch}`);
};

export const getCurrentBranch = () => {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
};

// This could be running on the main branch or on a branch that was created from the main branch.
// If hash given, we get all commits since that hash.
// If no hash given:
//  - If this is running on the main branch, we want to get all commits since the last release.
//  - If this is running on a branch that was created from the main branch, we want to get all commits since the branch was created.
export const getCommitsSinceRef = (branch: string, options: MeowOptions) => {
  if (options.flags.gitFetch !== false) {
    gitFetch(branch);
  }

  const currentBranch = getCurrentBranch();
  let sinceRef;

  if (!options.flags.hash) {
    // Get the real since branch created
    // https://stackoverflow.com/questions/2255416/how-can-i-determine-when-a-git-branch-was-created
    const refLogHashes = execSync(`git reflog show --pretty=format:"%h" ${currentBranch}`).toString().split('\n');

    if (refLogHashes.length > 1) {
      sinceRef = refLogHashes.pop();
    } else {
      // Fallback to latest diverge from master (commits not merged back)
      sinceRef = `origin/${branch}`;
    }
  } else {
    sinceRef = options.flags.hash;
  }

  if (currentBranch === branch) {
    try {
      if (!options.flags.hash) {
        sinceRef = execSync('git describe --tags --abbrev=0').toString();
      } else {
        sinceRef = options.flags.hash;
      }
    } catch (e) {
      logger(
        log,
        "No git tags found, using repo's first commit for automated change detection. Note: this may take a while.",
        options,
      );
      sinceRef = execSync('git rev-list --max-parents=0 HEAD').toString();
    }
  }

  const flags = '';
  // Not convinced `ancestry-path` should be used at all!? Wouldn't that miss out on merged in commits from other/temporary branches?!
  // if (!options.flags.hash) {
  //   flags = '--ancestry-path';
  // }

  const commits = execSync(`git rev-list ${flags} ${sinceRef}..HEAD`).toString().split('\n').filter(Boolean).reverse();

  if (!options.flags.hash && currentBranch !== branch && !commits.length) {
    logger(
      info,
      `No commits found - seems like branch is not diverged from 'origin/${branch}'!\nNOTE: Git doesn't feature a real "since branch created", so detecting this works only for commits not already in 'origin/$branch', but which at least is likely the "most deverged of" branch.\nTo force this behaviour, just provide a hash via '-h [hash]'.`,
      options,
    );
  }

  return commits;
};

// Take first line only and ignore possibly added backticks and apostrophes - e.g. added to commits or the changesets (but not both) for the changelog.
const compareChangeSet = (a: Changeset, b: Changeset): boolean => {
  return (
    a.summary.split('\n', 1)[0].replace(/(`|')/g, '') === b.summary.split('\n', 1)[0].replace(/(`|')/g, '') &&
    JSON.stringify(a.releases) == JSON.stringify(b.releases)
  );
};

export const difference = (a: Changeset[], b: Changeset[]): Changeset[] =>
  a.filter((changeA) => !b.some((changeB) => compareChangeSet(changeA, changeB)));
