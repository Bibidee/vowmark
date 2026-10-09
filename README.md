# VOWMARK

## Release tracks

This branch is the **V4 candidate**. V4 uses a 20-minute minimum review
window, the repaired final-window capacity policy, and the new source metadata
surface. Historical V4 canary contracts are deployed on Studionet and the V4
frontend has a separate Preview. That canary predates the final numeric-host
URL fix. Production V1 remains unchanged;
V4 must not reuse V1 addresses or the V1 production alias.

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
- Production frontend: [`the-vowmark.vercel.app`](https://the-vowmark.vercel.app/) — the original release deployment was `dpl_E7BqsrfqrsiPEEwEGnGS2iqQBXsd` from SHA `8dbb131958d28f87d9f618a9d2bbd09744a6986b`. On 2026-10-09 the alias resolved to READY production deployment `dpl_3bjNZZ4b3FwHTeXj5a6k4RuoUFGH`; its public bundle still contained the authorized V1 pair and no V4 addresses.
- Explorer: <https://explorer-studio.genlayer.com>

The deployment and configuration readback are recorded in [`evidence/fresh_deployment_2026-10-08_pagination.md`](evidence/fresh_deployment_2026-10-08_pagination.md). Final lifecycle evidence is stored under `evidence/live_*_final.json`; artifacts for the superseded contract pair are historical only.

The frontend records issuance hashes immediately, distinguishes provisional from finalized execution, reconciles Vault issuance and Registry registration separately, and provides issuer-only registration retry from `/issue` and `/activity` when the finalized child message is delayed.

## Candidate V4 deployment state

V4 requires a fresh Registry and Vault deployment because its storage and
evidence metadata surface differ from V1. The controlled Studionet deployment
and live canary evidence are recorded in
[`evidence/live_v4_smoke_2026-10-09.md`](evidence/live_v4_smoke_2026-10-09.md).

- Registry: [`0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26`](https://explorer-studio.genlayer.com/address/0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26)
- Vault: [`0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C`](https://explorer-studio.genlayer.com/address/0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C)
- Registry deployment: [`0xa89729b327ce510e46f0183dc95c2f7d57ba0073ae3c6f4f720010b048b3564f`](https://explorer-studio.genlayer.com/tx/0xa89729b327ce510e46f0183dc95c2f7d57ba0073ae3c6f4f720010b048b3564f)
- Vault deployment: [`0x87f195ae06bb4eb66deff61bdc5012f35d15c9dbacf0b943806a55183d5ed9ed`](https://explorer-studio.genlayer.com/tx/0x87f195ae06bb4eb66deff61bdc5012f35d15c9dbacf0b943806a55183d5ed9ed)
- Finalized wiring: [`0xc2c4bfae0fdb7f0b8c86459a4a5c8bb9ad61f6970fe642a6383fa8a1f60b36f4`](https://explorer-studio.genlayer.com/tx/0xc2c4bfae0fdb7f0b8c86459a4a5c8bb9ad61f6970fe642a6383fa8a1f60b36f4)
- V4 branch Preview alias: [`vowmark-git-v4-security-remediation-bibidees-projects.vercel.app`](https://vowmark-git-v4-security-remediation-bibidees-projects.vercel.app/). Verified corrected-source snapshot [`vowmark-9t7jotj8w-bibidees-projects.vercel.app`](https://vowmark-9t7jotj8w-bibidees-projects.vercel.app/) was READY on commit `869b70e` (`dpl_7oj5inoBkucQVo35KAyQtSRTEdKf`); it still bundles the historical canary addresses, not new contracts.

The preview is wired to the fresh V4 addresses through Preview-only Vercel
environment configuration. Production promotion remains a separate decision;
`https://the-vowmark.vercel.app/` continues to serve the authorized V1 build.
The canary contract source matches the `9d4082c` source snapshot retained
through `5e6a917`; the corrected source is not deployed. Withdrawal parent
calls and emitted external messages are verified, but independent delivery
is not: see [`evidence/live_v4_withdrawal_delivery_2026-10-09.md`](evidence/live_v4_withdrawal_delivery_2026-10-09.md).
