---
'changeset-conventional-commits': patch
---

fix: 🩹 recognition of `commits for branches` and `dublicate changesets`, prettify some code and add comments

- Fix recognition of commits for branches by getting them since "branch was created" via local `reflog`
  With fallback to when `branch last diverged` from `origin/${mainBranch}`.
- Improve detection of `dublicate changesets` by taking just the first line
  Also ignoring possibly added backticks and apostrophes - e.g. added to commits or the changesets (but not both) for the changelog.
- Add `Prettier` to `src/types/index.ts`
  [2023-09-15: Josh Tried Coding > 7 Awesome TypeScript Types You Should Know](https://www.youtube.com/watch?v=q5DFpyIN5Xs&t=179s)
- Add (plenty) comments
