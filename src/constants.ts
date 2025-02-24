// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

/** Default release heading prefix */
export const RELEASE_HEADING_PREFIX = '^## \\[?';

/** Default release heading suffix */
export const RELEASE_HEADING_SUFFIX = '[\\] ]';

/** Action's input name */
export enum InputName {
  CHANGELOG_FILE = 'changelog-file',
  RELEASE_NOTES_FILE = 'release-notes-file',
  RELEASE_VERSION = 'release-version',
  RELEASE_HEADING_PREFIX = 'release-heading-prefix',
  RELEASE_HEADING_SUFFIX = 'release-heading-suffix',
};
