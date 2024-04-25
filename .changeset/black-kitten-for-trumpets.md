---
'changeset-conventional-commits': minor
---

feat: 🚩 add support for `starting commit hash`, `output info only`, `process root package` and `path to run`

- Add flags `--hash`, `--info`, `--root` and `--path`
- Update output list for `new changesets`
  - List covered package(s)
  - Show `filename` of generated `changeset`
- Update `README.md`

<details>
  <summary>Details</summary>

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

...

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
