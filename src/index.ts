#! /usr/bin/env node
import readChangeset from '@changesets/read';
import writeChangeset from '@changesets/write';
import { getPackagesSync } from '@manypkg/get-packages';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  associateCommitsToConventionalCommitMessages,
  conventionalMessagesWithCommitsToChangesets,
  difference,
  getCommitsSinceRef,
} from './utils/index.js';
import { info, log, success } from '@changesets/logger';
import chalk from 'chalk';
import meow from 'meow';
import { Changeset } from '@changesets/types';
import type { LogHeaderOptions, MeowOptions } from './types/index.js';

const CHANGESET_CONFIG_LOCATION = path.join('.changeset', 'config.json');

const { input, flags, showHelp } = meow(
  `
  Usage
    $ changeset-conventional [options]
  Options
    --dry         -d    Dry run (don't write any changelogs), implies \`--verbose\`
    --git-fetch   -gf   Runs \`git fetch\` to update local repo
    --verbose           Gives verbose output
    --help        -h    Shows this help
    --version           Shows version
    `,
  {
    importMeta: import.meta,
    flags: {
      gitFetch: {
        type: 'boolean',
        shortFlag: 'gf',
      },
      dry: {
        type: 'boolean',
        shortFlag: 'd',
      },
      help: {
        type: 'boolean',
        shortFlag: 'h',
      },
      verbose: {
        type: 'boolean',
        shortFlag: 'v',
      },
    },
  },
);

const meowOptions: MeowOptions = { input, flags };

if (meowOptions.flags.help) {
  showHelp();
}

if (meowOptions.flags.dry) {
  meowOptions.flags.verbose = true;
}

const logger = <T>(logger: typeof log, m: T) => {
  if (meowOptions.flags.verbose) {
    logger(m);
  }
};

const logHeader = (m: string, o?: LogHeaderOptions) => {
  o = { ...{ newline: true, lead: true, bold: true }, ...o };

  return (o.newline ? '\n' : '') + (o.bold ? chalk.bold((o.lead ? ':: ' : '') + m) : (o.lead ? ':: ' : '') + m);
};

const changesetsSummaryFirstLine = (cs: Changeset[]) => {
  return cs.map((c) => c.summary.split('\n', 1)[0]);
};

let countChangesets = 0;

const conventionalCommitChangeset = async (
  cwd: string = process.cwd(),
  options: { ignoredFiles: (string | RegExp)[] } = { ignoredFiles: [] },
) => {
  logger(log, logHeader('Changeset Conventional Commits', { newline: false, lead: false }));
  logger(log, '\nRunning tasks...');

  const packages = getPackagesSync(cwd).packages.filter(
    (pkg) => !pkg.packageJson.private && Boolean(pkg.packageJson.version),
  );
  const changesetConfig = JSON.parse(fs.readFileSync(path.join(cwd, CHANGESET_CONFIG_LOCATION)).toString());
  const { baseBranch = 'main' } = changesetConfig;

  const commitsSinceBase = getCommitsSinceRef(baseBranch, meowOptions);
  logger(log, logHeader('Commits Since Base'));
  logger(log, commitsSinceBase);

  const commitsWithMessages = commitsSinceBase.map((commitHash) => ({
    commitHash,
    commitMessage: execSync(`git log -n 1 --pretty=format:%B ${commitHash}`).toString(),
  }));
  logger(log, logHeader('Commits With Message'));
  logger(log, commitsWithMessages);

  const changelogMessagesWithAssociatedCommits = associateCommitsToConventionalCommitMessages(commitsWithMessages);
  logger(log, logHeader('Changelog Messages With Associated Commits'));
  logger(log, changelogMessagesWithAssociatedCommits);

  const changesets = conventionalMessagesWithCommitsToChangesets(changelogMessagesWithAssociatedCommits, {
    ignoredFiles: options.ignoredFiles,
    packages,
  });
  logger(log, logHeader('Possible New Changesets'));
  logger(log, changesetsSummaryFirstLine(changesets));

  const currentChangesets = await readChangeset(cwd);
  logger(log, logHeader('Existing Changesets'));
  logger(log, changesetsSummaryFirstLine(currentChangesets));

  const newChangesets = currentChangesets.length === 0 ? changesets : difference(changesets, currentChangesets);
  logger(log, logHeader('New Changesets'));
  logger(log, changesetsSummaryFirstLine(newChangesets));

  newChangesets.forEach((changeset) => {
    if (!meowOptions.flags.dry) {
      writeChangeset(changeset, cwd);
    }
    countChangesets++;
  });
};

await conventionalCommitChangeset();

logger(log, logHeader('Report and Result'));

if (meowOptions.flags.dry) {
  logger(info, `Dry run: ${countChangesets} changesets would be generated`);
} else {
  logger(success, `${countChangesets} changesets generated`);
}
