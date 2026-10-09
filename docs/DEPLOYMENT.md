# VOWMARK Deployment Runbook

## Release separation

This runbook contains two deliberately separate tracks:

- **Production V1:** already deployed and authorized at the addresses in
  [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md). Its minimum review window
  is **15 minutes**. Those contracts and the production alias must remain
  unchanged.
- **Candidate V4:** this branch's undeployed release. Its minimum review
  window is **20 minutes**, its capacity policy includes the repaired bounded
  final-window reserve, and its Registry/Vault addresses are **unassigned**
  until a separately authorized deployment.

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

V4 has no contract addresses yet. Configure these only after a fresh,
finalized V4 deployment and configuration readback:

```text
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS=<fresh V4 Registry address>
NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS=<fresh V4 Vault address>
```

Do not leave stale V1 addresses or alternate networks in a V4 environment.

The deployed V1 Registry readback is historically **900 seconds (15
minutes)**. A fresh V4 Registry must read back this candidate timing policy
from `get_config()`:

- `min_review_window`: `1200` seconds;
- `retry_cooldown`: `300` seconds, scoped per reviewer;
- `review_epoch_seconds`: `3600` seconds;
- `max_review_attempts_per_epoch`: `32`;
- `max_review_window`: `7776000` seconds (90 days).

## Submission rule

`ACCEPTED` is not enough. Deployment/configuration/lifecycle transactions recorded as canonical evidence must be verified to the final state required by the current GenLayer runtime. Reread contract configuration after deployment. The V1 canonical addresses and evidence are in [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md) and [`../evidence/fresh_deployment_2026-10-08_pagination.md`](../evidence/fresh_deployment_2026-10-08_pagination.md). V4 must receive a separate evidence artifact; no V4 deployment evidence exists yet.
