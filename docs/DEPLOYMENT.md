# VOWMARK Deployment Runbook

## Fixed network

- GenLayer Studionet
- Chain ID `61999`
- RPC `https://studio.genlayer.com/api`
- Explorer `https://explorer-studio.genlayer.com`
- deployment CLI `0.39.2`; the contract package schema is checked before deployment

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
- final Direct Mode test result (Linux CI; Windows is an expected host xfail);
- CI run link;
- known limitation(s).

## Environment variables

The final implementation may refine names, but keep one obvious network configuration source. Suggested:

```text
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS=<real address>
NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS=<only if final architecture needs it>
```

Do not leave stale addresses or alternate networks in production environment configuration.

## Submission rule

`ACCEPTED` is not enough. Deployment/configuration/lifecycle transactions recorded as canonical evidence must be verified to the final state required by the current GenLayer runtime. Reread contract configuration after deployment. The current canonical addresses and evidence are in [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md).
