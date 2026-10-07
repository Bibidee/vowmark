# Handoff Status

This handoff now contains the VOWMARK V1 Registry/Vault contracts and Next.js frontend implementation.

It is **not** a deployment claim and it is **not** submission-ready.

No contract address, transaction hash, live verdict, production URL or finality proof is claimed until it is independently verified on GenLayer Studionet 61999.

## Verified locally

- repository-local CLI reports `0.39.1`;
- frontend typecheck, ESLint and serial production build pass;
- contract deployment script typechecks against `genlayer-js 0.9.0`;
- `genvm-lint lint` passes for both contracts;
- repository release guard passes;
- pinned static/adversarial checks pass (`4 passed`);
- current Direct Mode fixtures load, but the Windows runner test is explicitly marked xfail because `genlayer-test 0.29.2` closes its injected stdin temp file too late on Windows.

## Submission blockers

- no funded wallet or injected browser session was available for a real Studionet deployment;
- therefore there are no verified registry/vault addresses, finalized deployment/configuration hashes, production URL, live lifecycle IDs, verdict proofs or withdrawal proof;
- the current pinned `genvm-linter` cannot semantically load the legacy `py-genlayer:test` header, so only its fast lint command is claimed here.

The remaining release work is live verification: deploy both contracts, verify finalized wiring and lifecycle proofs on Studionet 61999, run browser/wallet checks, and publish only observed hashes, addresses and URLs in the release report.
