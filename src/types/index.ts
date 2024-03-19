import { Changeset } from '@changesets/types';

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

export interface MeowOptions {
  input: string[];
  flags: {
    gitFetch: boolean | undefined;
    dry: boolean | undefined;
    help: boolean | undefined;
    verbose: boolean | undefined;
  };
}

export interface LogHeaderOptions {
  newline?: boolean;
  lead?: boolean;
  bold?: boolean;
}

export type ChangesetConventionalCommit = Changeset & {
  packagesChanged: {
    dir: string;
    relativeDir: string;
    packageJson: PkgJson;
  }[];
};
