# VOWMARK V4 final certification checkpoint — 2026-10-09

## Verdict

The currently deployed V4 release is live at
[`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/) on
GenLayer Studionet 61999. Its configured pair is Registry
`0x3cA983F7CC78d10d3970a6Da719b12e17E4e4eF7` and Vault
`0xE9e153dc4E33762B2bA468EaC74bEABfe9cED4Ce`.

This certification branch is **source-ready but not deployment-certified**.
It adds a Registry bytecode change that preserves visibility when asynchronous
registrations finalize out of order. The change therefore requires a fresh
Registry/Vault pair, fresh live lifecycle acceptance, and separate production
promotion authorization. The existing production pair must not be described
as running this newer Registry source.

## Findings closed in source

- Sparse/out-of-order Registry delivery now tracks actual registered count and
  a separate scan upper bound. Recent and paginated reads skip gaps, and replay
  remains idempotent.
- Time-dependent board and commitment actions use a one-second live clock and
  refresh immediately on focus and visibility changes.
- V2 and V4 CI are branch-scoped and have separate release guards.
- Activity records now retain the exact Registry/Vault pair. Legacy hashes are
  kept as finalized transaction evidence without unsafe canonical readback
  against a different deployment.
- Current documentation identifies Production V4 correctly while preserving
  historical V1 and earlier V4 evidence.

## Verification

- Python surface suite: 10 passed, 3 skipped by environment.
- Simulator suite: 90 passed.
- Direct Mode: 9 passed using an in-repository Windows test directory.
- Mutation inventory: 49 generated, 49 killed, zero survived/invalid/tool-limited.
- Frontend typecheck, lint, board, timezone, issue validation, and production
  build: passed.
- Playwright desktop/mobile/responsive suite: 44 passed.
- Production dependency audit: zero vulnerabilities.
- V4 release consistency and whitespace checks: passed.

## Live browser baseline

The production board and issuer page exposed four indexed records: fulfilled,
breached, inconclusive/open, and expired unresolved. The activity page retained
finalized transaction hashes. A live browser console check exposed stale local
activity attempting readback against the current pair; the source remediation
above prevents that deployment mismatch for both legacy and future records.

## Authorization boundary

No replacement contract was deployed, no Vercel environment was changed, no
production alias was promoted, and no wallet transaction was requested during
this checkpoint. Those actions remain blocked pending explicit authorization
after review of this source diff.
