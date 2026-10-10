# VOWMARK

## Release tracks

The authorized release is **Production V4** at
[`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/), using a
20-minute minimum review window and the Registry/Vault pair recorded in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). The live deployment has already
demonstrated fulfilled, breached, inconclusive, expired-unresolved, and
withdrawal paths on Studionet 61999.

**Historical V1** used a 15-minute minimum review window and the addresses in
[`HANDOFF_STATUS.md`](HANDOFF_STATUS.md). V1 contracts do not enforce V4's
20-minute policy; their frozen evidence remains historical and is not evidence
for the current release. Contract-source changes on this branch require a new
Registry/Vault pair, a Preview, and fresh authorization before production can
move again.

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

## Production V4 review timing policy

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

## Historical V1 deployment

VOWMARK V1 is deployed on GenLayer Studionet 61999. The canonical frontend deployment and final source provenance are recorded in [`HANDOFF_STATUS.md`](HANDOFF_STATUS.md); older deployments are superseded.

- Registry: [`0x3Be513bB6CAe652826A6092C0715AF39E7189c71`](https://explorer-studio.genlayer.com/address/0x3Be513bB6CAe652826A6092C0715AF39E7189c71)
- Vault: [`0xf8D89f89aD160546780eD76Cd64C550d91bAf501`](https://explorer-studio.genlayer.com/address/0xf8D89f89aD160546780eD76Cd64C550d91bAf501)
- Registry deployment: [`0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1`](https://explorer-studio.genlayer.com/tx/0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1)
- Vault deployment: [`0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938`](https://explorer-studio.genlayer.com/tx/0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938)
- Finalized wiring: [`0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e`](https://explorer-studio.genlayer.com/tx/0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e)
- Historical frontend evidence: the original release deployment was `dpl_E7BqsrfqrsiPEEwEGnGS2iqQBXsd` from SHA `8dbb131958d28f87d9f618a9d2bbd09744a6986b`.
- Explorer: <https://explorer-studio.genlayer.com>

The deployment and configuration readback are recorded in [`evidence/fresh_deployment_2026-10-08_pagination.md`](evidence/fresh_deployment_2026-10-08_pagination.md). Final lifecycle evidence is stored under `evidence/live_*_final.json`; artifacts for the superseded contract pair are historical only.

The frontend records issuance hashes immediately, distinguishes provisional from finalized execution, reconciles Vault issuance and Registry registration separately, and provides issuer-only registration retry from `/issue` and `/activity` when the finalized child message is delayed.

## Production V4 deployment state

V4 required a fresh Registry and Vault deployment because its storage and
evidence metadata surface differ from V1. The controlled Studionet deployment
and live acceptance evidence are recorded in
[`evidence/live_v4_final_submission_2026-10-10.md`](evidence/live_v4_final_submission_2026-10-10.md).

- Registry: [`0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707`](https://explorer-studio.genlayer.com/address/0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707)
- Vault: [`0x7cd9B38266eC92024c938354c498245D34314bd7`](https://explorer-studio.genlayer.com/address/0x7cd9B38266eC92024c938354c498245D34314bd7)
- Registry deployment: [`0x5701dc1cc4e401ba1d2fac4c33f7569066cb0b5a09640399ba668137472909a6`](https://explorer-studio.genlayer.com/tx/0x5701dc1cc4e401ba1d2fac4c33f7569066cb0b5a09640399ba668137472909a6)
- Vault deployment: [`0xf51dc5f59ecd5f13993a559d810e9266138227f8d788ef0d71d7a70daa375a33`](https://explorer-studio.genlayer.com/tx/0xf51dc5f59ecd5f13993a559d810e9266138227f8d788ef0d71d7a70daa375a33)
- Registry/Vault wiring: [`0x4617ff6909478706602912b3ea135c1b234088d1c080486d8d5407218aa92a2b`](https://explorer-studio.genlayer.com/tx/0x4617ff6909478706602912b3ea135c1b234088d1c080486d8d5407218aa92a2b)
- Production frontend: [`the-vowmark.vercel.app`](https://the-vowmark.vercel.app/), deployment `dpl_FUeNAXRgLLzKoUCUtb4QSNCXR9Ez`, source `67afe8ef5b029bf54ef6f9cf18f811881532c240`.

The finalized readback confirms the two-way pointers and the V4 policy:
`1200`-second minimum review window, `300`-second per-reviewer cooldown,
`3600`-second review epoch, `32` normal attempts per epoch, four late-reserve
attempts, and a `7776000`-second maximum review window. The current pair was
used for the fulfilled, breached, inconclusive-then-expired, and remedy-wallet
withdrawal acceptance records. The final Vault accounting readback is zero
balance, zero locked bond, zero issuer credit, zero remedy credit and zero
accounted liabilities.

The sparse-registration fix is present in the audited source and is covered by
the simulator regression test. The available Studionet RPC evidence does not
provide a source-verified bytecode attestation, so the live address is not
described as cryptographically source-verified; the deployment, frontend
bundle, finalized behavior and readbacks are recorded separately.

The earlier `0x3cA983...` / `0xE9e153...` V4 pair remains historical evidence
only. Its rejected-payable recovery transaction is preserved and clearly
labeled as historical rather than attributed to the current production pair.
