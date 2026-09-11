#!/usr/bin/env node
/**
 * Pre-distribution sanity check (standalone repo variant).
 *
 * This repo is a `git subtree split` of aegiscode-plugin's desktop/ — the
 * upstream monorepo copies ../client/aegis.js into vendor/ at build time,
 * but there is no ../client here, so vendor/aegis.js and
 * vendor/foreign-memory.js are committed directly as the source of truth.
 * This step only verifies they exist before packaging; it never writes them.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const desktop = join(here, '..');

const required = ['vendor/aegis.js', 'vendor/foreign-memory.js'];

for (const rel of required) {
  const p = join(desktop, rel);
  if (!existsSync(p)) {
    throw new Error(`missing ${p} — this file must be committed, not generated`);
  }
  console.log(`verified ${p}`);
}
