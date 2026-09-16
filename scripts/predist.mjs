#!/usr/bin/env node
/**
 * Pre-distribution sanity check (standalone repo variant).
 *
 * This repo is a `git subtree split` of aegiscode-plugin's desktop/ — the
 * upstream monorepo copies ../client/*.js into vendor/ at build time,
 * but there is no ../client here, so vendor/aegis.js, vendor/foreign-memory.js,
 * vendor/credentials.js and vendor/session-store.js are committed directly as
 * the source of truth.
 * This step only verifies they exist before packaging; it never writes them.
 *
 * Keep them in step with the monorepo's client/ — main.js and
 * lib/sync/sessions.js resolve these by path when the repo layout is absent,
 * so a stale copy here is what the packaged app actually runs.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const desktop = join(here, '..');

const required = [
  'vendor/aegis.js',
  // main.js resolves the npm update checker as `../client/update.js` first and
  // falls back to `./vendor/update.js` inside a bare `catch`. In this repo the
  // first path can never resolve, so if this file is absent the second require
  // throws into the same swallow and the app degrades to
  // `status: 'disabled', error: 'update checker unavailable'` with no build
  // error — exactly the silent gap that shipped in v0.5.1. Verify it here.
  'vendor/update.js',
  'vendor/foreign-memory.js',
  // The account credential store and the unified session store. Both are read
  // by all three AEGIS hosts through the same file; the app resolves them from
  // vendor/ here, and from ../client/ in the monorepo.
  'vendor/credentials.js',
  'vendor/session-store.js',
];

for (const rel of required) {
  const p = join(desktop, rel);
  if (!existsSync(p)) {
    throw new Error(`missing ${p} — this file must be committed, not generated`);
  }
  console.log(`verified ${p}`);
}
