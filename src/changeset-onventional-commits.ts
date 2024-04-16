#! /usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readChangeset from '@changesets/read';
import writeChangeset from '@changesets/write';
import { error, info, log, success } from '@changesets/logger';
import { getPackagesSync } from '@manypkg/get-packages';
import meow from 'meow';
import {
  associateCommitsToConventionalCommitMessages,
  changesetsSummaryFirstLine,
  conventionalMessagesWithCommitsToChangesets,
  difference,
  getCommitsSinceRef,
  getCurrentBranch,
  logHeader,
  logger,
} from './utils/index.js';
import type { ChangesetConventionalCommits } from './types/index.js';

export const init = async (): Promise<ChangesetConventionalCommits | undefined> => {
  const CHANGESET_CONFIG_LOCATION = path.join('.changeset', 'config.json');

  const { input, flags, showHelp, showVersion } = meow(
    `
    Usage
      $ changeset-conventional [options]

    Options
      --dry               -d    Dry run, don't write any files/changesets
      --git-fetch [bool]  -g    Set 'false' to not run 'git fetch' to update local repo | Default: 'true'
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

  const packages = getPackagesSync(cwd).packages.filter(
    (pkg) => !pkg.packageJson.private && Boolean(pkg.packageJson.version),
  );
  const changesetConfig = JSON.parse(fs.readFileSync(path.join(cwd, CHANGESET_CONFIG_LOCATION)).toString());
  const { baseBranch: branchBase = 'main' } = changesetConfig;
  const branchCurrent = getCurrentBranch();

  logger(log, logHeader('Infos/Notes'), options);

  if (options.flags.dry) {
    logger(log, `   Dry run, not writing any files/changesets (--dry)`, options);
  }

  if (options.flags.gitFetch === false) {
    logger(log, `   Not running 'git fetch' to update local repo (--git-fetch false)`, options);
  }

  return {
    branchBase,
    branchCurrent,
    cwd,
    options,
    packages,
  };
};

export const main = async (changesetConventionalCommits: ChangesetConventionalCommits) => {
  const { branchBase, cwd, options } = changesetConventionalCommits;

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

  const changelogMessagesWithAssociatedCommits = associateCommitsToConventionalCommitMessages(commitsWithMessages);

  if (options.flags.verbosity) {
    logger(log, logHeader('Changelog Messages With Associated Commits'), options);
    logger(
      log,
      changelogMessagesWithAssociatedCommits.reduce(
        (s, c, i) =>
          s +
          // DODO: Indicate number of truncated lines!
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
