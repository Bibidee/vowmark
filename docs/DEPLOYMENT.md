# VOWMARK Deployment Runbook

## Release separation

This runbook contains two deliberately separate tracks:

- **Production V1:** already deployed and authorized at the addresses in
  [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md). Its minimum review window
  is **15 minutes**. Those contracts and the production alias must remain
  unchanged.
- **Candidate V4:** this branch's separately deployed Studionet canary. Its
  minimum review window is **20 minutes**, its capacity policy includes the
  repaired bounded final-window reserve, and its Preview frontend is separate
  from the V1 production alias. It is not promoted to production.

The above V4 canary was built before the shortened numeric-IP fix. Its
Registry/Vault addresses are historical evidence, not the corrected release.
Do not wire those addresses as though they contain the new bytecode.

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

## Production V1 environment variables

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

## Candidate V4 environment variables

These values are configured for the V4 Preview branch after the fresh,
finalized **historical canary** deployment and configuration readback. They
must be replaced in a separately authorized corrected-V4 preview only after
fresh deployment and finalized readback:

```text
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS=0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26
NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS=0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C
```

Do not leave stale V1 addresses or alternate networks in a V4 environment.
The latest verified pre-fix Preview is
[`vowmark-7xflueq8o-bibidees-projects.vercel.app`](https://vowmark-7xflueq8o-bibidees-projects.vercel.app/),
deployment `dpl_2KmXJ98a1UeATTvDnQ1FkzszKbwq`, linked by the GitHub Vercel
status check to commit `5e6a917`. On 2026-10-09, `/`, `/issue`, `/activity`
and `/commitment/1` returned HTTP 200; the public `/issue` JavaScript bundle
contained both historical V4 addresses and the Studionet chain ID. This is
route/configuration evidence, not a corrected-contract deployment.

## Corrected V4 deployment sequence (requires new authorization)

1. Pin the final reviewed commit and run all local and exact-head CI gates.
2. Obtain explicit deployment-wallet authorization for the new transactions.
3. Deploy a **new** Registry with zero Vault placeholder and a **new** Vault
   bound to the new Registry; finalize both and record distinct addresses and
   hashes. Do not move GEN from either historical pair.
4. Wire the Registry to the new Vault with the authorized deployer, finalize,
   then read back addresses and the 1200-second policy.
5. Set Preview-only Vercel environment variables to the new pair, deploy a
   separate Preview, verify bundled addresses/routes and run an essential
   new live economic canary including changed URL rejection.
6. Keep V1 production and its alias untouched until a separate promotion
   authorization after live acceptance.

The deployed V1 Registry readback is historically **900 seconds (15
minutes)**. A fresh V4 Registry must read back this candidate timing policy
from `get_config()`:

- `min_review_window`: `1200` seconds;
- `retry_cooldown`: `300` seconds, scoped per reviewer;
- `review_epoch_seconds`: `3600` seconds;
- `max_review_attempts_per_epoch`: `32`;
- `max_review_window`: `7776000` seconds (90 days).

## Submission rule

`ACCEPTED` is not enough. Deployment/configuration/lifecycle transactions recorded as canonical evidence must be verified to the final state required by the current GenLayer runtime. Reread contract configuration after deployment. The V1 canonical addresses and evidence are in [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md) and [`../evidence/fresh_deployment_2026-10-08_pagination.md`](../evidence/fresh_deployment_2026-10-08_pagination.md). V4 deployment, lifecycle, expiry, withdrawal, and validator/model evidence are recorded in [`../evidence/live_v4_smoke_2026-10-09.md`](../evidence/live_v4_smoke_2026-10-09.md) and [`../evidence/live_v4_validator_model_2026-10-09.md`](../evidence/live_v4_validator_model_2026-10-09.md).
