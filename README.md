# changeset-conventional-commits

Generate changesets based on the conventional commits.

## Install

```
pnpm add -D changeset-conventional-commits
```

## Usage

1. Make sure the project is setup with changesets.
2. Run `pnpm changeset-conventional` in the root.

This will generate changeset for each commit.

## Known issues

- Should be run in a branch.
- Seems this generate duplicate changeset if you run multiple times.

## Note

This library is created based on this [PR](https://github.com/willwill96/mono-repo-tools/pull/4/files). There are issues created in changesets
for this functionality and there is not update on this yet. So I created this
library till that support is implemented.
