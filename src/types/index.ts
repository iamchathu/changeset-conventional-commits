import { Changeset, Config as ChangesetsConfig } from '@changesets/types';
import { Package } from '@manypkg/get-packages';

export interface PkgJson {
  name?: string;
  version?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  bundledDependencies?: string[];
  bin?: string | Record<string, string>;
  scripts?: Record<string, string>;
  engines?: Record<string, string>;
  files?: string[];
  main?: string;
  browser?: string;
  types?: string;
  typings?: string;
  module?: string;
  unpkg?: string;
  sideEffects?: boolean;
  workspaces?: string[];
}

export interface ManyPkgPackage {
  packageJson: PkgJson;
  dir: string;
}

export interface ManyPkgPackages {
  packages: ManyPkgPackage[];
  root: ManyPkgPackage;
}

export interface Commit {
  hash: string;
  message: string;
}

export interface ConventionalMessagesToCommits {
  changelogMessage: string;
  commitHashes: string[];
}

export interface MeowOptions {
  input: string[];
  flags: {
    dry: boolean | undefined;
    gitFetch: boolean | undefined;
    private: boolean | undefined;
    verbosity: boolean | undefined;
    help: boolean | undefined;
    version: boolean | undefined;
  };
}

export interface LogHeaderOptions {
  newline?: boolean;
  lead?: boolean;
  bold?: boolean;
}

export type ChangesetConventionalCommitsPackages = Changeset & {
  packagesChanged: {
    dir: string;
    relativeDir: string;
    packageJson: PkgJson;
  }[];
};

export interface CommitTypes {
  type: string;
  section: string;
}

export interface ChangesetConventionalCommitsConfig {
  commitTypes: CommitTypes[];
}

export interface ChangesetConventionalCommits {
  branchBase: string;
  branchCurrent: string;
  config: ChangesetConventionalCommitsConfig;
  configChangesets: ChangesetsConfig;
  cwd: string;
  ignoredFiles?: (string | RegExp)[];
  options: MeowOptions;
  packages: Package[];
}
