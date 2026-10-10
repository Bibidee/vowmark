# VOWMARK Deployment Runbook

## Release separation

This runbook contains three deliberately separate tracks:

- **Historical V1:** the 15-minute deployment recorded in
  [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md). Its frozen evidence remains
  historical and must not be presented as V4 evidence.
- **Production V4:** the authorized Studionet release at
  [`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/). It uses
  the 20-minute policy, Registry `0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707`,
  and Vault `0x7cd9B38266eC92024c938354c498245D34314bd7`.
- **V4 Preview:** any later contract-source change must use a fresh pair and a
  separate Preview until exact-head tests, live acceptance, and production
  promotion receive fresh authorization.

The original V4 canary and the earlier V4 production pair are historical
evidence only. The current pair above was deployed, lifecycle-tested, and
promoted to production on 2026-10-10. The latest exact-head frontend source is
the `v4-final-certification` branch at commit
`67afe8ef5b029bf54ef6f9cf18f811881532c240`.

Never use V1 addresses as evidence that V4 has been deployed, and never read
the V4 20-minute policy back from the V1 contracts.

## Fixed network

- GenLayer Studionet
- Chain ID `61999`
- RPC `https://studio.genlayer.com/api`
- Explorer `https://explorer-studio.genlayer.com`
- deployment CLI `0.39.2`; the contract package schema is checked before deployment
- contract package runtime pin: `genlayer@0.39.2`; frontend SDK pin: `genlayer-js@0.9.0`

Do not silently switch networks to make deployment easier.

## Required deployment evidence

Record only values observed from the final build:

- final Git commit SHA;
- contract address(es);
- deployment transaction hash(es);
- constructor/configuration values;
- finalized-only settlement configuration if a vault is used;
- frontend production URL;
- frontend build commit;
- one canonical fulfilled lifecycle;
- one canonical inconclusive/recovery path;
- one canonical breached lifecycle where safe and practical;
- withdrawal transaction(s);
- final Direct Mode test result (Linux CI and the repository's Windows stdin compatibility patch);
- CI run link;
- known limitation(s).

## Historical V1 environment variables

The final implementation may refine names, but keep one obvious network configuration source. Suggested:

```text
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS=0x3Be513bB6CAe652826A6092C0715AF39E7189c71
NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS=0xf8D89f89aD160546780eD76Cd64C550d91bAf501
```

These values describe only the authorized V1 frontend. Do not copy them into
a V4 preview or use them as V4 deployment evidence.

## Production V4 environment variables

These values are configured for Production V4 after finalized deployment,
configuration readback, live acceptance, and promotion:

```text
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS=0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707
NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS=0x7cd9B38266eC92024c938354c498245D34314bd7
```

Do not leave stale V1 addresses or alternate networks in a V4 environment.
The only canonical VOWMARK production URL is
[`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/). Vercel
deployment `dpl_FUeNAXRgLLzKoUCUtb4QSNCXR9Ez` is `READY`/`production`; its
deployment URL is
[`vowmark-gesqbdt6o-bibidees-projects.vercel.app`](https://vowmark-gesqbdt6o-bibidees-projects.vercel.app/).
The production HTML/JavaScript bundle contains the current Registry, Vault and
Studionet explorer configuration. Older V4 Preview aliases and deployments
are historical snapshots only.

## Current V4 deployment sequence (authorized and executed)

1. Pin the final reviewed commit and run all local and exact-head CI gates.
2. Obtain explicit deployment-wallet authorization for the new transactions.
3. Deploy a **new** Registry with zero Vault placeholder and a **new** Vault
   bound to the new Registry; finalize both and record distinct addresses and
   hashes. Do not move GEN from either historical pair.
4. Wire the Registry to the new Vault with the authorized deployer, finalize,
   then read back addresses and the 1200-second policy.
5. Set the Vercel production configuration to the authorized pair, deploy the
   exact frontend commit, verify bundled addresses/routes and run the live
   economic canary.
6. Promote only after separate authorization following live acceptance.

The current Registry deployment was finalized in
[`0x5701dc1c…2909a6`](https://explorer-studio.genlayer.com/tx/0x5701dc1cc4e401ba1d2fac4c33f7569066cb0b5a09640399ba668137472909a6),
the Vault in
[`0xf51dc5f5…75a33`](https://explorer-studio.genlayer.com/tx/0xf51dc5f59ecd5f13993a559d810e9266138227f8d788ef0d71d7a70daa375a33),
and one-time wiring in
[`0x4617ff69…92a2b`](https://explorer-studio.genlayer.com/tx/0x4617ff6909478706602912b3ea135c1b234088d1c080486d8d5407218aa92a2b).
Finalized readback confirmed both pointers, chain `61999`, and the policy
below. Current-pair live lifecycle evidence is in
[`../evidence/live_v4_final_submission_2026-10-10.md`](../evidence/live_v4_final_submission_2026-10-10.md).

The rejected-payable recovery transaction in
[`../evidence/live_v4_final_rejected_value_2026-10-09.json`](../evidence/live_v4_final_rejected_value_2026-10-09.json)
belongs to the superseded `0x3cA983…` / `0xE9e153…` pair and is retained as
historical evidence. It must not be relabeled as a current-pair transaction.

The deployed V1 Registry readback is historically **900 seconds (15
minutes)**. A fresh V4 Registry must read back this candidate timing policy
from `get_config()`:

- `min_review_window`: `1200` seconds;
- `retry_cooldown`: `300` seconds, scoped per reviewer;
- `review_epoch_seconds`: `3600` seconds;
- `max_review_attempts_per_epoch`: `32`;
- `max_review_window`: `7776000` seconds (90 days).

## Submission rule

`ACCEPTED` is not enough. Deployment/configuration/lifecycle transactions recorded as canonical evidence must be verified to the final state required by the current GenLayer runtime. Reread contract configuration after deployment. The V1 canonical addresses and evidence are in [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md) and [`../evidence/fresh_deployment_2026-10-08_pagination.md`](../evidence/fresh_deployment_2026-10-08_pagination.md). Current V4 deployment, lifecycle, expiry, withdrawal, validator/model and browser evidence are recorded in [`../evidence/live_v4_final_submission_2026-10-10.md`](../evidence/live_v4_final_submission_2026-10-10.md). The older V4 reports remain historical and are not rewritten.
