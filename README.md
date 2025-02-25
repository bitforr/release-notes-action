# Release Notes Action

This action extracts release notes from an existing changelog file.

## Examples

### Extract release notes

```yaml
on:
  push:
    branches:
    - main
  pull_request:
    branches:
    - main
jobs:
  release-notes:
    runs-on: ubuntu-latest
    steps:
    - name: check out repository
      uses: actions/checkout@v4
    - name: extract release notes for v1.2.6
      uses: eaasi/release-notes-action@v0.6
      with:
        changelog-file: ./CHANGELOG.md
        release-notes-file: ./release-notes.md
        release-version: v1.2.6
    - name: use extracted release notes
      run: cat ./release-notes.md
```

### Check if release notes exist

```yaml
on:
  push:
    branches:
    - main
  pull_request:
    branches:
    - main
jobs:
  release-notes:
    runs-on: ubuntu-latest
    steps:
    - name: check out repository
      uses: actions/checkout@v4
    - id: release-notes-checker
      name: check release notes for v1.2.6
      uses: eaasi/release-notes-action@v0.6
      continue-on-error: true
      with:
        changelog-file: ./CHANGELOG.md
        release-version: v1.2.6
    - name: run if release notes exist
      if: ${{ steps.release-notes-checker.outcome == 'success' }}
      run: echo "Found release notes for v1.2.6!"
```

## License

This project is licensed under the [Apache-2.0](./LICENSE) license.

Copyright (c) 2025 Yale University (unless otherwise noted).
