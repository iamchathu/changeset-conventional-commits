# Changeset Conventional Commits

Generate `changesets` based on [Conventional Commits] to integrate with [Changesets].

[![npm](https://img.shields.io/npm/v/changeset-conventional-commits.svg)](https://www.npmjs.com/package/changeset-conventional-commits)
[![Known Vulnerabilities](https://snyk.io/test/github/iamchathu/changeset-conventional-commits/badge.svg)](https://snyk.io/test/github/iamchathu/changeset-conventional-commits)
[![Code Climate](https://codeclimate.com/github/iamchathu/changeset-conventional-commits/badges/gpa.svg)](https://codeclimate.com/github/iamchathu/changeset-conventional-commits)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/iamchathu/changeset-conventional-commits/master/LICENSE)

```
Generate Changesets from Conventional Commits

  Usage
    $ changeset-conventional [options]

  Options
    --dry               -d    Dry run, don't write any files/changesets
    --git-fetch [bool]  -g    Set 'false' to not run 'git fetch' to update local repo | Default: 'true'
    --hash [hash]       -h    Process commits from after 'hash' instead of last tag/release
    --info              -i    Output project info only
    --private [bool]    -p    Override Changesets' setting for private packages
    --pwd [path]        -P    Path in which to execute
    --root              -r    Process and generate changesets for root package
    --verbosity [bool]  -v    Give verbose output - 'false' to suppress
    --help              -H    Show this help
    --version           -V    Show version
```

## Features

- 📦 Support for regular and `monorepos`

- 🫚 `Changeset generation` for the root (`/`) package and its `commits`

- 🎋 Detect being on `main branch` like `master` or a `branch` and handling it accordingly

- 🕵🏻 Handle and generate `changesets` for `private packages`

- 😻 Extensive logging/output
  <details>
    <summary>Details</summary>

    Using `-rg false -h 50bf163` for `--root`, `--git-fetch false` and given `--hash`

    ```sh
    > changeset-conventional -rg false -h 50bf163
    ```

    outputs like:

    ```
    Changeset Conventional Commits

    :: Infos/Notes
       Config '.changeset/config-conventional.json' found and loaded
       Being on branch 'testing'
       Process commits from after '50bf163 (--hash)
       Detected monorepo with workspaces - generating changesets for workspace packages (e.g. 'packages/*')
       Generate changesets also for root package (--root)
       Not running 'git fetch' to update local repo (--git-fetch false)

    :: Start at (after) Hash
       50bf163 - 2024-03-21 (4 weeks ago) - github-actions[bot] - chore: version package (#30)

    :: Package(s)
       changeset-cc-test-01 - 0.0.0 - (private) - 'packages/test-01'
       changeset-cc-test-02 - 0.0.0 - (private) - 'packages/test-02'
       changeset-conventional-commits - 0.2.5 - '.'

    :: Changelog Messages With Associated Commits

       chore: update to ESM to use latest Meow
       [19cfa4f0afa6d415920cfbae4c6b6c7d904c15f6]

       feat: add cli helper, logging and flags --dry, --git-fetch and --verbose
       [4720e3be91f512ae79975c851fcf190a6eab6f92, 576677468d4308afaad42f2561d1b44a3c5648f1]

       chore: add packages 'chalk' and 'meow'
       [87cee64f78f21263dbe4985188d62c043a00073d]

       chore: monorepo packages added
       [7c16e6557a405ab09817543e24889433d86f689a]

       docs (changeset-cc-test-01): update 'README.md'
       [1e17a73ab1073574187b87f037cde839d350553f]

       docs (changeset-cc-test-02): update 'README.md'
       [3ad152c4e6d5fc7377545ede20cc52c44d38097a]

    :: Possible New Changesets
       chore: update to ESM to use latest Meow
       feat: add cli helper, logging and flags --dry, --git-fetch and --verbose
       chore: add packages 'chalk' and 'meow'
       chore: monorepo packages added
       docs (changeset-cc-test-01): update 'README.md'
       docs (changeset-cc-test-02): update 'README.md'

    :: Existing Changesets
       chore: update to ESM to use latest Meow
       feat: add cli helper, logging and flags --dry, --git-fetch and --verbose

    :: New Changesets

       chore: add packages 'chalk' and 'meow'
       strong-kitten-meow-hard: [changeset-conventional-commits]

       chore: monorepo packages added
       ultimate-kitten-dominate: [changeset-cc-test-01, changeset-cc-test-02]

       docs (changeset-cc-test-01): update 'README.md'
       lets-go-brandon: [changeset-cc-test-01]

       docs (changeset-cc-test-02): update 'README.md'
       black-kitten-for-trumpets: [changeset-cc-test-02]

    :: Report and Result
    success 4 changesets generated
    ```

  </details>

## Why

Benefit of both - the convenience of `Conventional Commits` with the `precise control` and `details` of [Changesets]! 🥳🎉

- Don't neglect your lovely and well-treated `commits` and `changelog`, just commit away and fill in the details later.

- Convincing your team to more detailed `changelogs`? Soft-introduce [Changesets] to a team used to `Conventional Commits`.

- Separating documentation from developers? Great, just let your `docs team` handle combined `commits` and `changelogs` via `changesets` when working on documentation.

- And probably a whole bunch more!

Adaption of `Changesets` - getting it and its concept where it belongs, together with other features still in the pipe within their issues and MRs/PRs.

## Limitations

### Association with Commits

Currently, generated `changesets` will be associated with the commit they'll come with, so `changelog` entries created by like `@changesets/changelog-github` will link the commit of the `changeset` instead of the ones they're created for.

This will still be addressed by adding the actual originating commit hashes to the `changesets`, so `changelog generators` can associate them with the correct commits.

As this will need support within the `changelog generator`, we're likely going to provide MRs/PRs to the existing ones and/or provide own ones.

### Root Package Changesets

`Changesets` for `root packages` are still to be supported/implemented within `Changesets` itself
[2023-04-18: Changesets for the monorepo root workspace (#1137)](https://github.com/changesets/changesets/issues/1137)

## Notes

### Private Packages

> `"private": true` set in `package.json`

Changesets' default is to `allow` private packages: [Managing applications or non-npm packages](https://github.com/changesets/changesets/blob/main/docs/versioning-apps.md).

According to Changesets' settings for `"privatePackages"` in `.changesets/config.json`, which has a default of `{ version: true, tag: false }`, where only `version: false` would exclude `private` packages.

### Commits Detection

If on `main`, like `master`, get commits since last `release`/`tag`.

If on a `branch`, get commits since `"branch was created"` via local `reflog`, with fallback to when branch last diverged from `origin/${mainBranch}`.

> As `Git` doesn't feature a real "since branch created" (no date of creation on branch info), the detection works only for locally created branches still within reflog (90 days by default), with a fallback detection when branch last diverged from master - its commits not already merged back into `origin/[master]`.
> But you can always force the expected behaviour by providing a start after hash `-h [hash]`.

### Heritage

This package was initially created based on this [PR](https://github.com/willwill96/mono-repo-tools/pull/4/files) and there're issues[^conventional-commits-issues] created over at [Changesets][changesets issues] for this functionality and there're no updates on this yet. So I created this library till support is implemented.

> E.g. 
> - [2022-07-06: Streamline changeset generation with conventional commit support #862](https://github.com/changesets/changesets/issues/862)
> - [2021-31-12: How to generate changelog by conventional commits? #727](https://github.com/changesets/changesets/issues/727).

## Usage Without Installation

- Using **pnpm**

```sh
pnpm dlx changeset-conventional-commits
```

- Using **npx**

```sh
npx changeset-conventional-commits
```

## Install

```sh
// Locally
pnpm add -D changeset-conventional-commits

// Globally
pnpm add -g changeset-conventional-commits
```

## Usage

1. Make sure the project is setup with [Changesets].
2. Run `pnpm changeset-conventional` in the root.

This will generate `changesets` for each commit.

## Options/Flags

- `--dry` (`-d`)

  Run and test all you need, nothing will be written.

- `--git-fetch` (`-g`) | Default: 'true'

  Set 'false' to speed up the process by skipping `git fetch` - useful for quick iterations of testing and development.

- `--hash` (`-h`)

  Process commits from after `hash` instead of last `tag`/`release` or `branch creation/diverge` - e.g. for non-release tags or already merged back branches.

- `--info` (`-i`)

  Output only the info/notes about this project's `Changeset`/`Conventional Commits` generation using the given flags.

- `--private` (`-p`)

  Generate (`true`) or not (`false`) changesets for private packages (`"private": true` set in `package.json`) regardless of settings for `"privatePackages"` in `.changesets/config.json`.

  E.g. `-p true` will always process private packages, whereby `-p false` will never.

- `--pwd` (`-P`)

  Run in given path.

- `--root` (`-r`)

  Generate `changesets` for `root` package.

- `--verbosity` (`-v`)

  Set for extra verbosity.

  Set `false` to suppress most output.

## Configuration

`.changesets/config-conventional.json`

- Commit Types of Conventional Commits for Changelog

  ```ts
  commitTypes: [
    { type: string, section: string},
    ...
  ]
  ```

  Default:

  ```ts
  [
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
    { type: 'devops', section: 'DevOps' },
  ];
  ```

<!-- urls -->

[changesets]: https://github.com/changesets/changesets/
[changesets issues]: https://github.com/changesets/changesets/
[conventional commits]: https://medium.com/neudesic-innovation/conventional-commits-a-better-way-78d6785c2e08
