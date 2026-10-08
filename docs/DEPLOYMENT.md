# VOWMARK Deployment Runbook

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

## Environment variables

The final implementation may refine names, but keep one obvious network configuration source. Suggested:

```text
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS=0x3Be513bB6CAe652826A6092C0715AF39E7189c71
NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS=0xf8D89f89aD160546780eD76Cd64C550d91bAf501
```

Do not leave stale addresses or alternate networks in production environment configuration.

The deployed Registry must read back this timing policy from `get_config()`:

- `min_review_window`: `900` seconds;
- `retry_cooldown`: `300` seconds, scoped per reviewer;
- `review_epoch_seconds`: `3600` seconds;
- `max_review_attempts_per_epoch`: `32`;
- `max_review_window`: `7776000` seconds (90 days).

## Submission rule

`ACCEPTED` is not enough. Deployment/configuration/lifecycle transactions recorded as canonical evidence must be verified to the final state required by the current GenLayer runtime. Reread contract configuration after deployment. The current canonical addresses and evidence are in [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md) and [`../evidence/fresh_deployment_2026-10-08_pagination.md`](../evidence/fresh_deployment_2026-10-08_pagination.md).
