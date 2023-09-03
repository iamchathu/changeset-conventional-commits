# changeset-conventional-commits

Generate changesets based on the conventional commits.

[![npm](https://img.shields.io/npm/v/changeset-conventional-commits.svg)](https://www.npmjs.com/package/changeset-conventional-commits)
[![Known Vulnerabilities](https://snyk.io/test/github/iamchathu/changeset-conventional-commits/badge.svg)](https://snyk.io/test/github/iamchathu/changeset-conventional-commits)
[![Code Climate](https://codeclimate.com/github/iamchathu/changeset-conventional-commits/badges/gpa.svg)](https://codeclimate.com/github/iamchathu/changeset-conventional-commits)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/iamchathu/changeset-conventional-commits/master/LICENSE)

## Use without adding as a dev dependancy

* Using **pnpm**

```sh
pnpm dlx changeset-conventional-commits
```

* Using **npx**

```sh
npx changeset-conventional-commits
```

## Install

```
pnpm add -D changeset-conventional-commits
```

## Usage

1. Make sure the project is setup with changesets.
2. Run `pnpm changeset-conventional` in the root.

This will generate changeset for each commit.

## Note

This library is created based on this [PR](https://github.com/willwill96/mono-repo-tools/pull/4/files). There are issues created in changesets
for this functionality and there is not update on this yet. So I created this
library till that support is implemented.
