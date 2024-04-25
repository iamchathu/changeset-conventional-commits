---
'changeset-conventional-commits': minor
---

feat: ✨ use Changesets' config (`ignore`, `private`) and support for `private` packages

- Add support for `private packages` (`"private": true` set in `package.json`) depending on settings for `"privatePackages"` in `.changesets/config.json`
- Add flag `--private`
- Add list of `packages` to output
- Update `README.md`
- Address and fix [Only works for public packages #25](https://github.com/iamchathu/changeset-conventional-commits/issues/25)
- Add `@changesets/config@3.0.0`

<details>
  <summary>Details</summary>

```
Generate Changesets from Conventional Commits

  Usage
    $ changeset-conventional [options]

  Options
    --dry               -d    Dry run, don't write any files/changesets
    --git-fetch [bool]  -g    Set 'false' to not run 'git fetch' to update local repo | Default: 'true'
    --private [bool]    -p    Override Changesets' setting for private packages
    --verbosity [bool]  -v    Give verbose output - 'false' to suppress
    --help              -H    Show this help
    --version           -V    Show version
```

Using `-dpg false` for `--dry`, `--private` and `--git-fetch false`

```sh
> changeset-conventional -dpg false
```

outputs like:

```
Changeset Conventional Commits

:: Infos/Notes
   Generate changesets for private packages regardless of Changeses' settings for 'privatePackages' (--private)
   Not running 'git fetch' to update local repo (--git-fetch false)
   Dry run, not writing any files/changesets (--dry)

:: Package(s)
   changeset-cc-test-01 - 0.0.0 - (private) - 'packages/test-01'
   changeset-cc-test-02 - 0.0.0 - (private) - 'packages/test-02'

...
```

</details>
