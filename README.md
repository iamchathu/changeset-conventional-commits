# changeset-conventional-commits

Generate changesets based on the conventional commits.

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
    --verbosity [bool]  -v    Give verbose output - 'false' to suppress
    --help              -H    Show this help
    --version           -V    Show version
```

## Features

- 😻 Extensive logging/output
  <details>
    <summary>Details</summary>

    Using `-v` for `--verbosity`

    ```sh
    > changeset-conventional -v
    ```

    outputs like:

    ```
    Changeset Conventional Commits

    :: Infos/Notes
       Dry run, not writing any files/changesets (--dry)
       Not running 'git fetch' to update local repo (--git-fetch false)

    :: Commits Since Base
       19cfa4f0afa6d415920cfbae4c6b6c7d904c15f6
       4720e3be91f512ae79975c851fcf190a6eab6f92
       576677468d4308afaad42f2561d1b44a3c5648f1
       7c16e6557a405ab09817543e24889433d86f689a
       1e17a73ab1073574187b87f037cde839d350553f
       3ad152c4e6d5fc7377545ede20cc52c44d38097a

    :: Commits With Message
       19cfa4f0afa6d415920cfbae4c6b6c7d904c15f6: chore: update to ESM to use latest Meow
       4720e3be91f512ae79975c851fcf190a6eab6f92: feat: add cli helper, logging and flags --dry, --git-fetch and --verbose
       576677468d4308afaad42f2561d1b44a3c5648f1: non-conventional test
       7c16e6557a405ab09817543e24889433d86f689a: chore: monorepo packages added
       1e17a73ab1073574187b87f037cde839d350553f: docs (changeset-cc-test-01): update 'README.md'
       3ad152c4e6d5fc7377545ede20cc52c44d38097a: docs (changeset-cc-test-02): update 'README.md'

    :: Changelog Messages With Associated Commits

       chore: update to ESM to use latest Meow
       [19cfa4f0afa6d415920cfbae4c6b6c7d904c15f6]

       feat: add cli helper, logging and flags --dry, --git-fetch and --verbose
       [4720e3be91f512ae79975c851fcf190a6eab6f92, 576677468d4308afaad42f2561d1b44a3c5648f1]

       chore: monorepo packages added
       [7c16e6557a405ab09817543e24889433d86f689a]

       docs (changeset-cc-test-01): update 'README.md'
       [1e17a73ab1073574187b87f037cde839d350553f]

       docs (changeset-cc-test-02): update 'README.md'
       [3ad152c4e6d5fc7377545ede20cc52c44d38097a]

    :: Possible New Changesets
       chore: monorepo packages added
       docs (changeset-cc-test-01): update 'README.md'
       docs (changeset-cc-test-02): update 'README.md'

    :: Existing Changesets
       feat: add cli helper, logging and flags --dry, --git-fetch and --verbose
       chore: update to ESM to use latest Meow

    :: New Changesets
       chore: monorepo packages added
       docs (changeset-cc-test-01): update 'README.md'
       docs (changeset-cc-test-02): update 'README.md'

    :: Report and Result
    info Dry run: 3 changesets would be generated
    ```

  </details>

## Use without adding as a dev dependancy

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

1. Make sure the project is setup with changesets.
2. Run `pnpm changeset-conventional` in the root.

This will generate changeset for each commit.

## Options/Flags

- `--dry` (`-d`)

  Run and test all you need, nothing will be written.

- `--git-fetch` (`-g`) | Default: 'true'

  Set 'false' to speed up the process by skipping `git fetch` - useful for quick iterations of testing and development.

- `--verbosity` (`-v`)

  Set for extra verbosity.

  Set `false` to suppress most output.

## Note

This library is created based on this [PR](https://github.com/willwill96/mono-repo-tools/pull/4/files). There are issues created in changesets
for this functionality and there is not update on this yet. So I created this
library till that support is implemented.
