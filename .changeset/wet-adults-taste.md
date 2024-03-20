---
'changeset-conventional-commits': patch
---

fix: duplicate generation of changesets (#26)

The same changesets were generated again, because the duplicate detection failed on trailing line breaks (`\n`) it got from `git`.

<details>
  <summary>Details</summary>
  Imagine this data it holds while duplicate checking:

  `const changesets = ...:`

  ```ts
  // Data from Commits
  [
    {
      releases: [[Object], [Object]],
      summary: 'chore(root): add two test packages\n',
      packagesChanged: [[Object], [Object]],
    },
  ];
  ```

  `const currentChangesets = ...:`

  ```ts
  // Data from Changesets
  [
    {
      releases: [[Object], [Object]],
      summary: 'chore(root): add two test packages',
      packagesChanged: [[Object], [Object]],
    },
  ];
  ```

  Truncating the linebreak at [line 165](https://github.com/iamchathu/changeset-conventional-commits/blob/a4d324693eca549b0d016a162442eef49477ec75/src/utils/index.ts#L165) of `src/utils/index.ts` fixed it:

  ```ts
  const compareChangeSet = (a: Changeset, b: Changeset): boolean => {
    // return a.summary === b.summary && JSON.stringify(a.releases) == JSON.stringify(b.releases);
    return a.summary.replace(/\n$/, '') === b.summary && JSON.stringify(a.releases) == JSON.stringify(b.releases);
  };
  ```
</details>
