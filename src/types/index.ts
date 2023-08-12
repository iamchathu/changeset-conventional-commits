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
