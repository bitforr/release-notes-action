// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fs, vol } from 'memfs';
import * as core from '@actions/core';
import { main } from '../src/main.js';
import { InputName, OutputName } from '../src/constants.js';
import { FormatterV1, FormatterV2, Changelog } from './changelog.js';

vi.mock('node:fs');
vi.mock('node:fs/promises');
vi.mock('readline');
vi.mock('@actions/core');

const WORKDIR = '/data';

const VERSIONS = [
  'v2.5.0',
  'v2.0.2',
  'v1.5.5',
  'v1.0.0',
  'v0.5.0',
];

const MISSING_VERSIONS = [
  'v25',
  'v2.5',
  'v2.0.0',
  'v1.55',
  'v1.5.55',
  'v1',
  '0.5',
];

const CHANGELOGS = [
  Changelog.create('changelog-01.md', VERSIONS, new FormatterV1()),
  Changelog.create('changelog-02.md', VERSIONS, new FormatterV2()),
];

interface TestData {
  changelog: Changelog,
  version: string,
}

beforeEach(() => {
  // Prepare in-memory fs
  vol.mkdirSync(WORKDIR);
});

afterEach(() => {
  vi.resetAllMocks();

  // Reset in-memory fs
  vol.reset();
});

describe('check release notes (+)', () => {
  const TESTCASES: TestData[] = [];
  for (const c of CHANGELOGS) {
    for (const v of VERSIONS) {
      const data: TestData = {
        changelog: c,
        version: v,
      };

      TESTCASES.push(data);
    }
  }

  test.each(TESTCASES)('for $version from $changelog.name', async (data) => {
    const params = {
      version: data.version,
      paths: {
        changelog: `${WORKDIR}/changelog.md`,
      },
    };

    // Mock input parameters
    const inputs = vi.mocked(core.getInput);
    inputs.mockImplementation((name) => {
      switch (name) {
        case InputName.CHANGELOG_FILE:
          return params.paths.changelog;
        case InputName.RELEASE_VERSION:
          return params.version;
        default:
          return '';
      }
    });

    // Prepare input data
    fs.writeFileSync(params.paths.changelog, data.changelog.render());

    // Run action
    await main();

    // Check output parameters
    const release = data.changelog.findRelease(params.version);
    const outputs = expect(core.setOutput);
    outputs.toHaveBeenCalledWith(OutputName.RELEASE_NOTES, release?.notes);
  });
});

describe('check release notes (-)', () => {
  const TESTCASES: TestData[] = [];
  for (const c of CHANGELOGS) {
    for (const v of MISSING_VERSIONS) {
      const data: TestData = {
        changelog: c,
        version: v,
      };

      TESTCASES.push(data);
    }
  }

  test.fails.each(TESTCASES)('for $version from $changelog.name', async (data) => {
    const params = {
      version: data.version,
      paths: {
        changelog: `${WORKDIR}/changelog.md`,
      },
    };

    // Mock input parameters
    const inputs = vi.mocked(core.getInput);
    inputs.mockImplementation((name) => {
      switch (name) {
        case InputName.CHANGELOG_FILE:
          return params.paths.changelog;
        case InputName.RELEASE_VERSION:
          return params.version;
        default:
          return '';
      }
    });

    // Prepare input data
    fs.writeFileSync(params.paths.changelog, data.changelog.render());

    // Run action
    await main();
  });
});

describe('extract release notes (+)', () => {
  const TESTCASES: TestData[] = [];
  for (const c of CHANGELOGS) {
    for (const v of VERSIONS) {
      const data: TestData = {
        changelog: c,
        version: v,
      };

      TESTCASES.push(data);
    }
  }

  test.each(TESTCASES)('for $version from $changelog.name', async (data) => {
    const params = {
      version: data.version,
      paths: {
        changelog: `${WORKDIR}/changelog.md`,
        notes: `${WORKDIR}/release-notes.md`,
      },
    };

    // Mock input parameters
    const inputs = vi.mocked(core.getInput);
    inputs.mockImplementation((name) => {
      switch (name) {
        case InputName.CHANGELOG_FILE:
          return params.paths.changelog;
        case InputName.RELEASE_NOTES_FILE:
          return params.paths.notes;
        case InputName.RELEASE_VERSION:
          return params.version;
        default:
          return '';
      }
    });

    // Prepare input data
    fs.writeFileSync(params.paths.changelog, data.changelog.render());

    // Run action
    await main();

    // Check output parameters
    const release = data.changelog.findRelease(params.version);
    const outputs = expect(core.setOutput);
    outputs.toHaveBeenCalledWith(OutputName.RELEASE_NOTES, release?.notes);

    // Check output data
    expect(fs.existsSync(params.paths.notes)).toBeTruthy();
    const notes = fs.readFileSync(params.paths.notes).toString();
    expect(notes).toEqual(release?.notes);
  });
});

describe('extract release notes (-)', () => {
  const TESTCASES: TestData[] = [];
  for (const c of CHANGELOGS) {
    for (const v of MISSING_VERSIONS) {
      const data: TestData = {
        changelog: c,
        version: v,
      };

      TESTCASES.push(data);
    }
  }

  test.fails.each(TESTCASES)('for $version from $changelog.name', async (data) => {
    const params = {
      version: data.version,
      paths: {
        changelog: `${WORKDIR}/changelog.md`,
        notes: `${WORKDIR}/release-notes.md`,
      },
    };

    // Mock input parameters
    const inputs = vi.mocked(core.getInput);
    inputs.mockImplementation((name) => {
      switch (name) {
        case InputName.CHANGELOG_FILE:
          return params.paths.changelog;
        case InputName.RELEASE_NOTES_FILE:
          return params.paths.notes;
        case InputName.RELEASE_VERSION:
          return params.version;
        default:
          return '';
      }
    });

    // Prepare input data
    fs.writeFileSync(params.paths.changelog, data.changelog.render());

    // Run action
    await main();
  });
});
