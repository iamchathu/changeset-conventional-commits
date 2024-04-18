#! /usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import { read as configReadChangesets } from '@changesets/config';
import readChangeset from '@changesets/read';
import writeChangeset from '@changesets/write';
import { error, info, log, success } from '@changesets/logger';
import { Package, getPackagesSync } from '@manypkg/get-packages';
import meow from 'meow';
import {
  associateCommitsToConventionalCommitMessages,
  changesetsSummary,
  changesetsSummaryFirstLine,
  configRead,
  conventionalMessagesWithCommitsToChangesets,
  difference,
  getCommitsSinceRef,
  getCurrentBranch,
  logHeader,
  logger,
} from './utils/index.js';
import { isListablePackage } from './utils/is-listable-package.js';
import type { ChangesetConventionalCommits } from './types/index.js';

export const init = async (): Promise<ChangesetConventionalCommits | undefined> => {
  const { input, flags, showHelp, showVersion } = meow(
    `
    Usage
      $ changeset-conventional [options]

    Options
      --dry               -d    Dry run, don't write any files/changesets
      --git-fetch [bool]  -g    Set 'false' to not run 'git fetch' to update local repo | Default: 'true'
      --hash [hash]       -h    Process commits from after 'hash' instead of last tag/release
      --info              -i    Output project info only
      --pwd [path]        -P    Path in which to execute
      --private [bool]    -p    Override Changesets' setting for private packages
      --root              -r    Process and generate changesets for root package
      --verbosity [bool]  -v    Give verbose output - 'false' to suppress
      --help              -H    Show this help
      --version           -V    Show version
    `,
    {
      importMeta: import.meta,
      booleanDefault: undefined,
      flags: {
        dry: {
          type: 'boolean',
          shortFlag: 'd',
        },
        gitFetch: {
          type: 'boolean',
          shortFlag: 'g',
        },
        hash: {
          type: 'string',
          shortFlag: 'h',
        },
        info: {
          type: 'boolean',
          shortFlag: 'i',
        },
        pwd: {
          type: 'string',
          shortFlag: 'P',
        },
        private: {
          type: 'boolean',
          shortFlag: 'p',
        },
        root: {
          type: 'boolean',
          shortFlag: 'r',
        },
        verbosity: {
          type: 'boolean',
          shortFlag: 'v',
        },
        help: {
          type: 'boolean',
          shortFlag: 'H',
        },
        version: {
          type: 'boolean',
          shortFlag: 'V',
        },
      },
    },
  );

  const options = { input, flags };

  if (options.flags.help) {
    showHelp();
  }

  if (options.flags.version) {
    showVersion();
  }

  logger(log, logHeader('Changeset Conventional Commits', { newline: false, lead: false }), options);

  const cwd: string = process.cwd();

  if (!fs.existsSync(`${cwd}/.changeset/`)) {
    logger(log, ``, options);
    logger(error, `No '.changeset/' in given folder '${cwd}'!`, options);
    return;
  }

  const { packages: repoPackages, rootPackage } = getPackagesSync(cwd);
  let packages: Package[] = [];

  const isMonorepo = repoPackages[0].packageJson.name !== rootPackage?.packageJson.name;

  // Check if it's a monorepo with root package set to private and `--root` set without `--private` enables/enforced
  if (isMonorepo && rootPackage && rootPackage.packageJson.private && options.flags.root && !options.flags.private) {
    logger(log, ``, options);
    logger(error, `'--root' set but root package is 'private' and '--private' not set`, options);
    return;
  }

  if (isMonorepo && options.flags.root && rootPackage) {
    packages = [...repoPackages, rootPackage];
  } else {
    packages = repoPackages;
  }

  const configChangesets = await configReadChangesets(cwd, { tool: 'root', packages, root: rootPackage as Package });

  if (options.flags.private === undefined) {
    packages = packages.filter((p) => isListablePackage(configChangesets, p.packageJson));

    // Check if not all packages are disabled by Changesets' config
    if (!packages.length) {
      logger(log, ``, options);
      logger(error, `No packages to process by Changesets' config`, options);
      return;
    }
  } else if (!options.flags.private) {
    packages = packages.filter((p) => !p.packageJson.private);

    if (!packages.length) {
      logger(log, ``, options);
      logger(error, `No packages to process as all are private!`, options);
      return;
    }
  }

  const { baseBranch: branchBase = 'main' } = configChangesets;
  const branchCurrent = getCurrentBranch();

  logger(log, logHeader('Infos/Notes'), options);

  const config = configRead(cwd, options);

  if (branchCurrent === branchBase) {
    logger(log, `   Being on "master/main" branch '${branchBase}'`, options);

    if (!options.flags.hash) {
      logger(log, `   Process commits since last release/tag or since "god's creation"`, options);
    }
  } else {
    logger(log, `   Being on branch '${branchCurrent}'`, options);

    if (!options.flags.hash) {
      logger(log, `   Process commits since branching off of 'origin/${branchBase}'`, options);
    }
  }

  if (options.flags.hash) {
    logger(log, `   Process commits from after '${options.flags.hash} (--hash)`, options);
  }

  if (!isMonorepo) {
    logger(log, `   Detected regular repo - no workspaces`, options);

    if (options.flags.root) {
      logger(
        log,
        `   Enabled root package processing will have no effect. not a monorepo, no workspaces (--root)`,
        options,
      );
    }
  } else {
    logger(
      log,
      `   Detected monorepo with workspaces - generating changesets for workspace packages (e.g. 'packages/*')`,
      options,
    );

    if (options.flags.root) {
      logger(log, `   Generate changesets also for root package (--root)`, options);
    }
  }

  if (options.flags.private === true) {
    logger(
      log,
      `   Generate changesets for private packages regardless of Changeses' settings for 'privatePackages' (--private)`,
      options,
    );
  } else if (options.flags.private === false) {
    logger(
      log,
      `   Not generating changesets for private packages regardless of Changeses' settings for 'privatePackages' (--private false)`,
      options,
    );
  }

  if (options.flags.gitFetch === false) {
    logger(log, `   Not running 'git fetch' to update local repo (--git-fetch false)`, options);
  }

  if (options.flags.dry) {
    logger(log, `   Dry run, not writing any files/changesets (--dry)`, options);
  }

  if (options.flags.hash) {
    try {
      const commitOfHash = execSync(
        `git show -q ${options.flags.hash} --date=short --pretty=format:"%h - %ad (%ar) - %an - %s" 2>&1`,
      ).toString();
      logger(log, logHeader('Start at (after) Hash'), options);
      logger(log, '   ' + commitOfHash.trimEnd(), options);
    } catch (e) {
      logger(log, ``, options);
      logger(error, `Hash ${options.flags.hash} doesn't exist!`, options);
      return;
    }
  }

  return {
    branchBase,
    branchCurrent,
    config,
    configChangesets,
    cwd,
    options,
    packages,
    rootPackage,
  };
};

export const main = async (changesetConventionalCommits: ChangesetConventionalCommits) => {
  const { branchBase, config, cwd, options, packages } = changesetConventionalCommits;

  logger(log, logHeader('Package(s)'), options);
  logger(
    log,
    packages.reduce(
      (s, p, i) =>
        s +
        `   ` +
        p.packageJson.name +
        (p.packageJson.version ? ` - ${p.packageJson.version}` : '') +
        (p.relativeDir !== '.' ? ` - '${p.relativeDir}'` : '') +
        (p.packageJson.private ? ` - (private)` : '') +
        (packages[i + 1] ? '\n' : ''),
      '',
    ),
    options,
  );

  if (options.flags.info) {
    return;
  }

  const commitsSinceBase = getCommitsSinceRef(branchBase, options);

  if (options.flags.verbosity) {
    logger(log, logHeader('Commits Since Base'), options);
    logger(
      log,
      commitsSinceBase.reduce((s, c, i) => s + `   ` + c + (commitsSinceBase[i + 1] ? '\n' : ''), ''),
      options,
    );
  }

  const commitsWithMessages = commitsSinceBase.map((hash) => ({
    hash,
    message: execSync(`git log -n 1 --pretty=format:%B ${hash}`).toString(),
  }));

  if (options.flags.verbosity) {
    logger(log, logHeader('Commits With Message'), options);
    logger(
      log,
      commitsWithMessages.reduce(
        (s, c, i) =>
          s +
          `   ` +
          c.hash +
          ': ' +
          c.message.split('\n', 1)[0].replace(/`/g, '') +
          (commitsWithMessages[i + 1] ? '\n' : ''),
        '',
      ),
      options,
    );
  }

  const changelogMessagesWithAssociatedCommits = associateCommitsToConventionalCommitMessages(
    commitsWithMessages,
    config,
  );

  if (options.flags.verbosity) {
    logger(log, logHeader('Changelog Messages With Associated Commits'), options);
    logger(
      log,
      changelogMessagesWithAssociatedCommits.reduce(
        (s, c, i) =>
          s +
          '   ' +
          c.changelogMessage.split('\n', 1)[0].replace(/`/g, '') +
          '\n' +
          '   [' +
          c.commitHashes.reduce(
            (hs, h, hi) =>
              hs + h + (c.commitHashes[hi + 1] ? ', ' : changelogMessagesWithAssociatedCommits[i + 1] ? ']\n' : ']'),
            '',
          ) +
          (changelogMessagesWithAssociatedCommits[i + 1] ? '\n' : ''),
        '\n',
      ),
      options,
    );
  }

  const changesets = conventionalMessagesWithCommitsToChangesets(
    changelogMessagesWithAssociatedCommits,
    changesetConventionalCommits,
  );

  logger(log, logHeader('Possible New Changesets'), options);

  if (!changesets.length) {
    logger(log, `   NONE`, options);
  } else {
    logger(log, changesetsSummaryFirstLine(changesets), options);
  }

  const currentChangesets = await readChangeset(cwd);

  logger(log, logHeader('Existing Changesets'), options);

  if (!currentChangesets.length) {
    logger(log, `   NONE`, options);
  } else {
    logger(log, changesetsSummaryFirstLine(currentChangesets), options);
  }

  const newChangesets = currentChangesets.length === 0 ? changesets : difference(changesets, currentChangesets);

  logger(log, logHeader('New Changesets'), options);

  if (!newChangesets.length) {
    logger(log, `   NONE`, options);
  } else if (!options.flags.dry) {
    const generatedChangesets = await Promise.all(
      newChangesets.map(async (c) => {
        return { ...c, id: await writeChangeset(c, cwd) };
      }),
    );
    logger(log, changesetsSummary(generatedChangesets), options);
  } else {
    logger(log, changesetsSummaryFirstLine(currentChangesets), options);

    if (!options.flags.dry) {
      newChangesets.forEach((changeset) => writeChangeset(changeset, cwd));
    }
  }

  logger(log, logHeader('Report and Result'), options);

  if (options.flags.dry) {
    logger(info, `Dry run: ${newChangesets.length} changesets would be generated`, options);
  } else {
    logger(success, `${newChangesets.length} changesets generated`, options);
  }

  return true;
};
