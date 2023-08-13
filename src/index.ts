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
} from './utils';

const CHANGESET_CONFIG_LOCATION = path.join('.changeset', 'config.json');

const conventionalCommitChangeset = async (
  cwd: string = process.cwd(),
  options: { ignoredFiles: (string | RegExp)[] } = { ignoredFiles: [] },
) => {
  const packages = getPackagesSync(cwd).packages.filter(
    (pkg) => !pkg.packageJson.private && Boolean(pkg.packageJson.version),
  );
  const changesetConfig = JSON.parse(fs.readFileSync(path.join(cwd, CHANGESET_CONFIG_LOCATION)).toString());
  const { baseBranch = 'main' } = changesetConfig;

  const commitsSinceBase = getCommitsSinceRef(baseBranch);

  const commitsWithMessages = commitsSinceBase.map((commitHash) => ({
    commitHash,
    commitMessage: execSync(`git log -n 1 --pretty=format:%s ${commitHash}`).toString(),
  }));

  const changelogMessagesWithAssociatedCommits = associateCommitsToConventionalCommitMessages(commitsWithMessages);

  const changesets = conventionalMessagesWithCommitsToChangesets(changelogMessagesWithAssociatedCommits, {
    ignoredFiles: options.ignoredFiles,
    packages,
  });

  const currentChangesets = await readChangeset(cwd);

  const newChangesets = currentChangesets.length === 0 ? changesets : difference(changesets, currentChangesets);

  newChangesets.forEach((changeset) => writeChangeset(changeset, cwd));
};

conventionalCommitChangeset();
