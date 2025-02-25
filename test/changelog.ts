// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import * as utils from './utils.js';

const BASE_URL = 'https://example.local/org/repo';

const COMMIT_TYPES = [
  'Features',
  'Bug Fixes',
  'Refactoring',
  'Testing',
  'Continuous Integration',
  'Documentation',
  'Miscellaneous',
];

export function makeReleaseNotes(version: string, formatter: IFormatter): string {
  const numCategories = 1 + utils.getRandomNumber(0, COMMIT_TYPES.length);
  const minNumCommits = utils.getRandomNumber(1, 6);
  const maxNumCommits = minNumCommits + 6;
  const lines: string[] = [];

  let numCommitsTotal = 0;

  for (let i = 0; i < numCategories; ++i) {
    formatter.hn(3, COMMIT_TYPES[i], lines);
    const numCommits = utils.getRandomNumber(minNumCommits, maxNumCommits);
    for (let j = 0; j < numCommits; ++j) {
      const count = ++numCommitsTotal;
      const sha = utils.makeCommitSha(4);
      lines.push(`- Change summary ${count} -- [${sha}](${BASE_URL}/commit/${sha})`);
    }

    lines.push('');
  }

  lines.push(`The more detailed changelog for ${version} can be found [here](${BASE_URL}/compare/${version}..HEAD).`);

  return lines.join('\n').trim();
}

export interface IFormatter {
  hn(level: number, title: string, output: string[]): void;
  release(release: Release, output: string[]): void;
}

export class FormatterV1 implements IFormatter {
  hn(level: number, title: string, output: string[]): void {
    const prefix = '#';
    output.push(`${prefix.repeat(level)} ${title}`);
    output.push('');
  }

  release(release: Release, output: string[]): void {
    this.hn(2, `${release.version} - *${release.date}*`, output);
    output.push(release.notes);
    output.push('');
  }
}

export class FormatterV2 implements IFormatter {
  hn(level: number, title: string, output: string[]): void {
    const prefix = '#';
    output.push(`${prefix.repeat(level)} ${title}`);
    output.push('');
  }

  release(release: Release, output: string[]): void {
    const version = release.version;
    this.hn(2, `[${version}](${BASE_URL}/compare/${version}..HEAD) - *${release.date}*`, output);
    output.push(release.notes);
    output.push('');
  }
}

export class Release {
  private _version: string;
  private _date: string;
  private _notes: string;

  get version() {
    return this._version;
  }

  get date() {
    return this._date;
  }

  get notes() {
    return this._notes;
  }

  static create(version: string, formatter: IFormatter): Release {
    const release = new Release();
    release._version = version;
    release._date = new Date().toISOString().substring(0, 10);
    release._notes = makeReleaseNotes(version, formatter);
    return release;
  }
}

export class Changelog {
  private _name: string;
  private _releases: Release[];
  private _formatter: IFormatter;

  get name() {
    return this._name;
  }

  get releases() {
    return this._releases;
  }

  get formatter() {
    return this._formatter;
  }

  findRelease(version: string): Release | undefined {
    return this.releases.find((r) => version === r.version);
  }

  render(): string {
    const lines: string[] = [];
    this.formatter.hn(1, 'Changelog', lines);
    for (const release of this.releases)
      this.formatter.release(release, lines);

    return lines.join('\n');
  }

  static create(name: string, versions: string[], formatter: IFormatter): Changelog {
    const changelog = new Changelog();
    changelog._name = name;
    changelog._formatter = formatter;
    changelog._releases = [];
    for (const version of versions) {
      changelog._releases.push(Release.create(version, formatter));
    }

    return changelog;
  }
}
