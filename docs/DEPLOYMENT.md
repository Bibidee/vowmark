# VOWMARK Deployment Runbook

## Release separation

This runbook contains three deliberately separate tracks:

- **Historical V1:** the 15-minute deployment recorded in
  [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md). Its frozen evidence remains
  historical and must not be presented as V4 evidence.
- **Production V4:** the authorized Studionet release at
  [`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/). It uses
  the 20-minute policy, Registry `0x3cA983F7CC78d10d3970a6Da719b12e17E4e4eF7`,
  and Vault `0xE9e153dc4E33762B2bA468EaC74bEABfe9cED4Ce`.
- **V4 Preview:** any later contract-source change must use a fresh pair and a
  separate Preview until exact-head tests, live acceptance, and production
  promotion receive fresh authorization.

The original V4 canary built before the shortened numeric-IP fix is historical
evidence only. The corrected pair above was deployed, lifecycle-tested, and
subsequently promoted to production on 2026-10-09.

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
NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS=0x3cA983F7CC78d10d3970a6Da719b12e17E4e4eF7
NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS=0xE9e153dc4E33762B2bA468EaC74bEABfe9cED4Ce
```

Do not leave stale V1 addresses or alternate networks in a V4 environment.
The V4 branch Preview alias is
[`vowmark-git-v4-security-remediation-bibidees-projects.vercel.app`](https://vowmark-git-v4-security-remediation-bibidees-projects.vercel.app/).
The previous corrected-pair Preview snapshot is
[`vowmark-8e9ojygxj-bibidees-projects.vercel.app`](https://vowmark-8e9ojygxj-bibidees-projects.vercel.app/),
deployment `dpl_H3PWWceADpvRcKJSvxaWny738cLr`. On 2026-10-09, `/`, `/issue`,
`/activity`, and `/commitment/1` returned HTTP 200; the public `/issue`
JavaScript contained the preceding V4 addresses. It is retained as historical
evidence only because the final Vault adds recoverable-credit handling for
rejected payable calls. The older snapshot on
commit `869b70e` was a corrected-source build pointed at historical canary
addresses and is not release evidence for the newly deployed pair.

## Corrected V4 deployment sequence (authorized and executed 2026-10-09)

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
6. Promote only after separate authorization following live acceptance; until
   then keep the existing Production V4 alias and addresses untouched.

The final Registry deployment was finalized in
[`0x88e4fce…b431e`](https://explorer-studio.genlayer.com/tx/0x88e4fce1aff18f5b1cd93d36111e8968bff7562ebbbc15cc7dba6236b0cb431e),
the Vault in
[`0xfefafc8…96efc`](https://explorer-studio.genlayer.com/tx/0xfefafc859f4509ec801e93f5f167d283d5c88f650f1bcdaa09422d8a02596efc),
and one-time wiring in
[`0x03a45b4…b309f`](https://explorer-studio.genlayer.com/tx/0x03a45b4dbebd5f87e2ea1c81efd1fbc5720606a084b6147872ab1875396b309f).
The finalized readback confirmed both pointers, chain `61999`, and the
policy below. A live `https://127.1/...` payable issuance returned the reserved
rejection marker with `evidence URL host is not public`, consumed no commitment
ID, credited the full bond to the issuer, and the issuer withdrew it in
[`0x557c821…c40d`](https://explorer-studio.genlayer.com/tx/0x557c82110299e1eb71b37c461159db7640d910e497c378cdeef054ee6545c40d).
This is the final custody-safe pair; the prior `0x1FB7…EE21` Registry and
`0x3fBC…55EE` Vault are historical and must not be configured in a new V4
Preview.

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
