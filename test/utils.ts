// SPDX-FileCopyrightText: 2025 Yale University
// SPDX-License-Identifier: Apache-2.0

import { randomBytes } from 'node:crypto';

export function getRandomNumber(min: number, max: number): number {
  const delta = (max - min) * Math.random();
  return Math.floor(min + delta);
}

export function makeCommitSha(length: number = 20): string {
  return randomBytes(length).toString('hex');
}
