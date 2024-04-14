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
  logHeader,
  logger,
} from './utils/index.js';

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

const meowOptions = { input, flags };

if (meowOptions.flags.help) {
  showHelp();
}

if (meowOptions.flags.version) {
  showVersion();
}

const conventionalCommitChangeset = async (options: { ignoredFiles: (string | RegExp)[] } = { ignoredFiles: [] }) => {
  logger(log, logHeader('Changeset Conventional Commits', { newline: false, lead: false }), meowOptions);

  const cwd = process.cwd();

  if (!fs.existsSync(`${cwd}/.changeset/`)) {
    logger(log, ``, meowOptions);
    logger(error, `No '.changeset/' in given folder '${cwd}'!`, meowOptions);
    return;
  }

  logger(log, logHeader('Infos/Notes'), meowOptions);

  if (meowOptions.flags.dry) {
    logger(log, `   Dry run, not writing any files/changesets (--dry)`, meowOptions);
  }

  if (meowOptions.flags.gitFetch === false) {
    logger(log, `   Not running 'git fetch' to update local repo (--git-fetch false)`, meowOptions);
  }

  const packages = getPackagesSync(cwd).packages.filter(
    (pkg) => !pkg.packageJson.private && Boolean(pkg.packageJson.version),
  );
  const changesetConfig = JSON.parse(fs.readFileSync(path.join(cwd, CHANGESET_CONFIG_LOCATION)).toString());
  const { baseBranch = 'main' } = changesetConfig;

  const commitsSinceBase = getCommitsSinceRef(baseBranch, meowOptions);

  if (meowOptions.flags.verbosity) {
    logger(log, logHeader('Commits Since Base'), meowOptions);
    logger(
      log,
      commitsSinceBase.reduce((s, c, i) => s + `   ` + c + (commitsSinceBase[i + 1] ? '\n' : ''), ''),
      meowOptions,
    );
  }

  const commitsWithMessages = commitsSinceBase.map((commitHash) => ({
    commitHash,
    commitMessage: execSync(`git log -n 1 --pretty=format:%B ${commitHash}`).toString(),
  }));

  if (meowOptions.flags.verbosity) {
    logger(log, logHeader('Commits With Message'), meowOptions);
    logger(
      log,
      commitsWithMessages.reduce(
        (s, c, i) =>
          s +
          `   ` +
          c.commitHash +
          ': ' +
          c.commitMessage.split('\n', 1)[0].replace(/`/g, '') +
          (commitsWithMessages[i + 1] ? '\n' : ''),
        '',
      ),
      meowOptions,
    );
  }

  const changelogMessagesWithAssociatedCommits = associateCommitsToConventionalCommitMessages(commitsWithMessages);

  if (meowOptions.flags.verbosity) {
    logger(log, logHeader('Changelog Messages With Associated Commits'), meowOptions);
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
      meowOptions,
    );
  }

  const changesets = conventionalMessagesWithCommitsToChangesets(changelogMessagesWithAssociatedCommits, {
    ignoredFiles: options.ignoredFiles,
    packages,
  });

  logger(log, logHeader('Possible New Changesets'), meowOptions);

  if (!changesets.length) {
    logger(log, `   NONE`, meowOptions);
  } else {
    logger(log, changesetsSummaryFirstLine(changesets), meowOptions);
  }

  const currentChangesets = await readChangeset(cwd);

  logger(log, logHeader('Existing Changesets'), meowOptions);

  if (!currentChangesets.length) {
    logger(log, `   NONE`, meowOptions);
  } else {
    logger(log, changesetsSummaryFirstLine(currentChangesets), meowOptions);
  }

  const newChangesets = currentChangesets.length === 0 ? changesets : difference(changesets, currentChangesets);

  logger(log, logHeader('New Changesets'), meowOptions);

  if (!newChangesets.length) {
    logger(log, `   NONE`, meowOptions);
  } else {
    logger(log, changesetsSummaryFirstLine(currentChangesets), meowOptions);

    if (!meowOptions.flags.dry) {
      newChangesets.forEach((changeset) => writeChangeset(changeset, cwd));
    }
  }

  logger(log, logHeader('Report and Result'), meowOptions);

  if (meowOptions.flags.dry) {
    logger(info, `Dry run: ${newChangesets.length} changesets would be generated`, meowOptions);
  } else {
    logger(success, `${newChangesets.length} changesets generated`, meowOptions);
  }
};

conventionalCommitChangeset();
