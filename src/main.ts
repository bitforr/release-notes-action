// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert';
import fs from 'node:fs/promises';
import { PathLike } from 'node:fs';
import * as readline from 'node:readline/promises';
import * as core from '@actions/core';
import { RELEASE_HEADING_PREFIX, RELEASE_HEADING_SUFFIX, InputName, OutputName } from './constants.js'

const TEXT_ENCODING = 'utf8';

export class FilterConfig {
  heading: {
    prefix: string;
    suffix: string;
  };

  constructor() {
    this.heading = {
      prefix: RELEASE_HEADING_PREFIX,
      suffix: RELEASE_HEADING_SUFFIX,
    };
  }
}

export interface ActionContext {
  filter?: FilterConfig,
  version: string,
  paths: {
    changelog: PathLike,
    notes: PathLike,
  },
}

async function extract(changelog: PathLike, version: string, config: FilterConfig): Promise<string[]> {
  const targetReleaseHeading = new RegExp(config.heading.prefix + version + config.heading.suffix);
  const releaseHeadingPrefix = new RegExp(config.heading.prefix);
  const lines: string[] = [];
  const fd = await fs.open(changelog, 'r');
  try {
    const reader = readline.createInterface({
      input: fd.createReadStream({ encoding: TEXT_ENCODING }),
    });

    let numLinesProcessed = 0;

    core.info(`Searching for release "${version}":`);
    try {
      for await (const line of reader) {
        ++numLinesProcessed;
        if (targetReleaseHeading.test(line)) {
          core.info('');
          core.info(`Found release heading at line ${numLinesProcessed}: ${line}`);
          break;
        }

        core.debug(`-> Skipping line ${numLinesProcessed}: ${line}`);
      }

      core.info('');
      core.info(`Extracting notes for release "${version}":`);
      for await (const line of reader) {
        ++numLinesProcessed;
        if (releaseHeadingPrefix.test(line)) {
          core.info('');
          core.info(`Found next release heading at line ${numLinesProcessed}, stopping.`);
          break;
        }

        core.info('> ' + line);
        lines.push(line);
      }
    }
    finally {
      reader.close();
    }

    core.info('');
    core.info(`Finished extracting notes for release "${version}":`);
    core.info(`-> ${lines.length} line(s) extracted, ${numLinesProcessed} processed`);
  }
  finally {
    await fd.close();
  }

  return Promise.resolve(lines);
}

/** Process changelog and extract release notes. */
export async function process(context: ActionContext): Promise<void> {
  if (!context.filter) {
    context.filter = new FilterConfig();
  }

  // Check input parameters...
  assert(context.filter.heading.prefix, 'Heading prefix is invalid!');
  assert(context.filter.heading.suffix, 'Heading suffix is invalid!');
  assert(context.paths.changelog, 'Changelog file is invalid!');
  assert(context.version, 'Release version is invalid!');

  // Extract release notes from changelog...
  const lines = await extract(context.paths.changelog, context.version, context.filter);
  const notes = lines.join('\n').trim();
  if (notes.length < 1) {
    throw new Error(`No release notes found for version "${context.version}"!`);
  }

  core.info('');

  // Output computed results...

  core.setOutput(OutputName.RELEASE_NOTES, notes);

  if (context.paths.notes) {
    core.info(`Writing release notes to "${context.paths.notes.toString()}":`);
    await fs.writeFile(context.paths.notes, notes, { encoding: TEXT_ENCODING });
    core.info(`-> ${notes.length} byte(s) written`);
  }
  else {
    core.warning('Skipped writing release notes. No output file specified!');
  }
}

/** The main function for the action. */
export async function main(): Promise<void> {
  const context: ActionContext = {
    version: core.getInput(InputName.RELEASE_VERSION),
    paths: {
      changelog: core.getInput(InputName.CHANGELOG_FILE),
      notes: core.getInput(InputName.RELEASE_NOTES_FILE),
    },
  };

  // Initialize optional input parameters...
  {
    context.filter = new FilterConfig();

    const releaseHeadingPrefix = core.getInput(InputName.RELEASE_HEADING_PREFIX);
    if (releaseHeadingPrefix) {
      context.filter.heading.prefix = releaseHeadingPrefix;
    }

    const releaseHeadingSuffix = core.getInput(InputName.RELEASE_HEADING_SUFFIX);
    if (releaseHeadingSuffix) {
      context.filter.heading.suffix = releaseHeadingSuffix;
    }
  }

  core.info(`Processing changelog "${context.paths.changelog.toString()}"...`);
  try {
    await process(context);
  }
  catch (error) {
    core.error(`Processing changelog "${context.paths.changelog.toString()}" failed!`);
    core.setFailed((error instanceof Error) ? error : 'Extracting release notes failed!');
    throw error;
  }
}
