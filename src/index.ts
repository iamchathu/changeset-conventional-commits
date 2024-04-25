#! /usr/bin/env node
import { init, main } from './changeset-onventional-commits.js';
import type { ChangesetConventionalCommits } from './types/index.js';

let changesetConventionalCommits: ChangesetConventionalCommits | undefined;

if ((changesetConventionalCommits = await init())) {
  await main(changesetConventionalCommits);
}
