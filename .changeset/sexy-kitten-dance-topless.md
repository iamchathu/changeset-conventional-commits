---
'changeset-conventional-commits': minor
---

feat: add cli helper, logging and flags for `--dry`, `--git-fetch` and `--verbose`

- Makes `git fetch` optional by default.

```sh
> changeset-conventional --help
```

<details>
  <summary>Details</summary>

```
Generate Changesets from conventional commits

  Usage
    $ changeset-conventional [options]
  Options
    --dry         -d    Dry run (don't write any changelogs), implies `--verbose`
    --git-fetch   -gf   Incl. run of `git fetch` to update local repo
    --verbose           Gives verbose output
    --help        -h    Shows this help
    --version           Shows version
```

So, `-d` for dry run, which implies `--verbose`

```sh
> changeset-conventional -d
```

reports back like:

```
🦋  Changeset Conventional Commits
🦋
🦋  Running tasks...
🦋
🦋  :: Commits Since Base
🦋  [
🦋    'e60f4fcd06ca8483a46cf287d663fd74dc9d7be3',
🦋    '1cfd74efbb737e53c6f6ff08ecec2c9d17d43590',
🦋    'ae571b7eab283389836e9ede11e95dcd64e5d10d'
🦋  ]
🦋
🦋  :: Commits With Message
🦋  [
🦋    {
🦋      commitHash: 'e60f4fcd06ca8483a46cf287d663fd74dc9d7be3',
🦋      commitMessage: 'fix: duplicate generation of changesets (#26)\n'
🦋    },
🦋    ...
🦋  ]
🦋
🦋  :: Changelog Messages With Associated Commits
🦋  [
🦋    {
🦋      changelogMessage: 'fix: duplicate generation of changesets (#26)\n',
🦋      commitHashes: [ 'e60f4fcd06ca8483a46cf287d663fd74dc9d7be3' ]
🦋    },
🦋    ...
🦋  ]
🦋
🦋  :: Possible New Changesets
🦋  [
🦋    'feat: add cli helper, logging and flags for `--dry`, `--git-fetch` and `--verbose`',
🦋    'chore: update to `ESM` for the future and to already use latest `Meow`⁽¹⁾'
🦋    'fix: duplicate generation of changesets (#26)'
🦋  ]
🦋
🦋  :: Existing Changesets
🦋  [
🦋    'fix: duplicate generation of changesets (#26)'
🦋  ]
🦋
🦋  :: New Changesets
🦋  [
🦋    'feat: add cli helper, logging and flags for `--dry`, `--git-fetch` and `--verbose`',
🦋    'chore: update to `ESM` for the future and to already use latest `Meow`⁽¹⁾'
🦋  ]
🦋
🦋  :: Report and Result
🦋  info Dry run: 0 changesets would be generated
```

</details>
