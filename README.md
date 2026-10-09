# VOWMARK

## Release tracks

This branch is the **V4 candidate**. V4 uses a 20-minute minimum review
window, the repaired final-window capacity policy, and the new source metadata
surface. It is **not deployed** and has no assigned Registry or Vault
addresses. A V4 frontend must receive newly deployed addresses through its
environment configuration before it can be used.

The authorized production release is **V1** at
[`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/). V1 uses
the original 15-minute minimum review window and the V1 addresses recorded in
[`HANDOFF_STATUS.md`](HANDOFF_STATUS.md). V1 contracts do not enforce V4's
20-minute policy. The V1 release and its historical evidence remain unchanged.

VOWMARK is a backendless GenLayer public-commitment protocol. An issuer puts GEN behind a time-bounded public promise, freezes the evidence policy before the deadline, and gives up unilateral control over the final judgment. After maturity, GenLayer validators independently inspect the declared public evidence and determine whether the commitment was `FULFILLED`, `BREACHED`, or `INCONCLUSIVE`.

The economic consequence is deterministic:

- `FULFILLED` → the issuer recovers the bond.
- `BREACHED` → the bond is credited to the immutable remedy address chosen at issuance.
- `INCONCLUSIVE` → no winner is manufactured; the commitment can be reviewed again subject to retry rules.
- If no reliable conclusion is reached by the final review deadline → `EXPIRED_UNRESOLVED`; the bond returns to the issuer and the unresolved result remains permanently visible in the issuer record.

The product is deliberately narrow: it is for **externally verifiable public commitments**, not private promises, subjective quality, legal disputes, freelance delivery, prediction markets, or generic fact checking.

## Why GenLayer

The central question is semantic and evidence-dependent:

> **Under the commitment exactly as recorded, and using only the admissible evidence policy frozen before maturity, does the public evidence establish that the commitment was fulfilled by its deadline?**

Neither the issuer nor a centralized application operator should control that answer. GenLayer supplies validator-side public web retrieval, model-assisted semantic judgment, and consensus. Deterministic contract logic handles authorization, lifecycle legality, bond accounting, retry limits, settlement and history.

Removing GenLayer would require replacing the core trust boundary with a trusted server, moderator or issuer-controlled decision system. That would materially weaken the product.

## Canonical architecture

```text
USER
  -> NEXT.JS APP ROUTER + TYPESCRIPT FRONTEND
  -> INJECTED EIP-1193 WALLET
  -> GENLAYER STUDIONET 61999
  -> VOWMARK INTELLIGENT CONTRACT LAYER
  -> VALIDATOR EVIDENCE RETRIEVAL + SEMANTIC JUDGMENT
  -> CANONICAL CONTRACT STATE
  -> FRONTEND
```

There is no application backend, server database, backend signer, cron worker, centralized AI endpoint, admin adjudicator or off-chain outcome authority.

## Absolute network

- Network: GenLayer Studionet
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Deployment CLI target: `0.39.2` with live schema validation

Never use Studio-dev or chain `61997`.

## Seven-stage product lifecycle

```text
ISSUE
  -> ACTIVE
  -> MATURE
  -> REVIEW
  -> JUDGMENT
  -> RESOLUTION / RECOVERY
  -> SETTLEMENT + PERMANENT RECORD
```

These are product phases, not a requirement to invent seven redundant storage enums. The contract state machine should remain minimal and explicit.

## Product outcomes

- `FULFILLED`
- `BREACHED`
- `INCONCLUSIVE`
- `EXPIRED_UNRESOLVED` as a terminal expiry result when no reliable decision exists by the final review deadline

Do not confuse these with GenLayer transaction/consensus statuses such as `ACCEPTED`, `FINALIZED`, `UNDETERMINED` or runtime failure.

## Candidate V4 review timing policy

- Minimum review window: **20 minutes** after maturity (`1200` seconds).
- Same-reviewer retry cooldown: **5 minutes** (`300` seconds), and the evidence snapshot must change.
- Review capacity epoch: **1 hour** (`3600` seconds).
- Maximum accepted attempts per epoch: **32**.
- Final-five-minute reserve: **up to 4 additional attempts after normal capacity is exhausted**; if the final five minutes cross an epoch boundary, normal capacity resets but the reserve remains bounded across the final window.
- Maximum review window: **90 days**.

The cooldown is per reviewer; the hourly capacity is per commitment. A coordinated Sybil set may still temporarily consume an epoch's capacity; V4 does not claim complete Sybil resistance.

## Core frontend routes

- `/` — Maturity Board
- `/issue` — issue a new commitment
- `/commitment/[id]` — canonical commitment record
- `/issuer/[address]` — public issuer history
- `/activity` — local transaction recovery and reconciliation

The frontend should feel like a public accountability register, not a deal dashboard, court, escrow console or developer terminal.

## Production V1 deployment

VOWMARK V1 is deployed on GenLayer Studionet 61999. The canonical frontend deployment and final source provenance are recorded in [`HANDOFF_STATUS.md`](HANDOFF_STATUS.md); older deployments are superseded.

- Registry: [`0x3Be513bB6CAe652826A6092C0715AF39E7189c71`](https://explorer-studio.genlayer.com/address/0x3Be513bB6CAe652826A6092C0715AF39E7189c71)
- Vault: [`0xf8D89f89aD160546780eD76Cd64C550d91bAf501`](https://explorer-studio.genlayer.com/address/0xf8D89f89aD160546780eD76Cd64C550d91bAf501)
- Registry deployment: [`0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1`](https://explorer-studio.genlayer.com/tx/0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1)
- Vault deployment: [`0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938`](https://explorer-studio.genlayer.com/tx/0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938)
- Finalized wiring: [`0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e`](https://explorer-studio.genlayer.com/tx/0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e)
- Production frontend: [`the-vowmark.vercel.app`](https://the-vowmark.vercel.app/) — Vercel deployment `dpl_E7BqsrfqrsiPEEwEGnGS2iqQBXsd`, built from application SHA `8dbb131958d28f87d9f618a9d2bbd09744a6986b`
- Explorer: <https://explorer-studio.genlayer.com>

The deployment and configuration readback are recorded in [`evidence/fresh_deployment_2026-10-08_pagination.md`](evidence/fresh_deployment_2026-10-08_pagination.md). Final lifecycle evidence is stored under `evidence/live_*_final.json`; artifacts for the superseded contract pair are historical only.

The frontend records issuance hashes immediately, distinguishes provisional from finalized execution, reconciles Vault issuance and Registry registration separately, and provides issuer-only registration retry from `/issue` and `/activity` when the finalized child message is delayed.

## Candidate V4 deployment state

V4 requires a fresh Registry and Vault deployment because its storage and
evidence metadata surface differ from V1. The V4 addresses, wiring
transaction, lifecycle proofs and withdrawal proof are intentionally **not
assigned** in this repository. Deployment, wallet signing, frontend preview
configuration and production promotion require separate authorization after
the local gates in [`docs/V4_RELEASE_CHECKLIST.md`](docs/V4_RELEASE_CHECKLIST.md)
are reviewed.
