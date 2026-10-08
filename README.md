# VOWMARK

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

## Core frontend routes

- `/` — Maturity Board
- `/issue` — issue a new commitment
- `/commitment/[id]` — canonical commitment record
- `/issuer/[address]` — public issuer history
- `/activity` — local transaction recovery and reconciliation

The frontend should feel like a public accountability register, not a deal dashboard, court, escrow console or developer terminal.

## Live deployment

VOWMARK V1 is deployed on GenLayer Studionet 61999 and the production frontend is [the-vowmark.vercel.app](https://the-vowmark.vercel.app).

- Registry: [`0xd1F0B0Ac5E148e6b16e6684dcb01C3a68B842f2d`](https://explorer-studio.genlayer.com/address/0xd1F0B0Ac5E148e6b16e6684dcb01C3a68B842f2d)
- Vault: [`0x925Dd2d3fd74b4C8d5205FEA48131d5fEF3e83ff`](https://explorer-studio.genlayer.com/address/0x925Dd2d3fd74b4C8d5205FEA48131d5fEF3e83ff)
- Registry deployment: [`0xee41807eaf5c63dd7d0eede4e0bfc4573b0daaa7b235b7fd84e7eec95febc8ea`](https://explorer-studio.genlayer.com/tx/0xee41807eaf5c63dd7d0eede4e0bfc4573b0daaa7b235b7fd84e7eec95febc8ea)
- Vault deployment: [`0x109d8012bfaab6561e112492e7808eb72f1bd0b7b1ef23095fde8adb7220d36c`](https://explorer-studio.genlayer.com/tx/0x109d8012bfaab6561e112492e7808eb72f1bd0b7b1ef23095fde8adb7220d36c)
- Finalized wiring: [`0x3001c417be1cb12530fa1fe1163d10e8cd899f1341f41a97494fe867de76c5ee`](https://explorer-studio.genlayer.com/tx/0x3001c417be1cb12530fa1fe1163d10e8cd899f1341f41a97494fe867de76c5ee)
- Production frontend: [the-vowmark.vercel.app](https://the-vowmark.vercel.app) (fresh frontend deployment pending)
- Explorer: <https://explorer-studio.genlayer.com>

The deployment and configuration readback are recorded in [`evidence/fresh_deployment_2026-10-08.md`](evidence/fresh_deployment_2026-10-08.md). Fresh lifecycle evidence is intentionally separate because the Registry source changed and all earlier proof artifacts are superseded.

The frontend records issuance hashes immediately, distinguishes provisional from finalized execution, reconciles Vault issuance and Registry registration separately, and provides issuer-only registration retry from `/issue` and `/activity` when the finalized child message is delayed.
