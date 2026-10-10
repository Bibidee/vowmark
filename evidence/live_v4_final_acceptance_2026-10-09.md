# VOWMARK V4 final live acceptance — 2026-10-09

> Historical acceptance report for the superseded `0x3cA983…` / `0xE9e153…`
> pair. The current production pair and final accounting are recorded in
> [`live_v4_final_submission_2026-10-10.md`](live_v4_final_submission_2026-10-10.md).

## Scope

This report covers the final custody-safe V4 candidate on GenLayer Studionet
(chain `61999`). Production V1 and `the-vowmark.vercel.app` were not changed.

- Registry: [`0x3cA983F7CC78d10d3970a6Da719b12e17E4e4eF7`](https://explorer-studio.genlayer.com/address/0x3cA983F7CC78d10d3970a6Da719b12e17E4e4eF7)
- Vault: [`0xE9e153dc4E33762B2bA468EaC74bEABfe9cED4Ce`](https://explorer-studio.genlayer.com/address/0xE9e153dc4E33762B2bA468EaC74bEABfe9cED4Ce)
- Registry deployment: [`0x88e4fce1aff18f5b1cd93d36111e8968bff7562ebbbc15cc7dba6236b0cb431e`](https://explorer-studio.genlayer.com/tx/0x88e4fce1aff18f5b1cd93d36111e8968bff7562ebbbc15cc7dba6236b0cb431e)
- Vault deployment: [`0xfefafc859f4509ec801e93f5f167d283d5c88f650f1bcdaa09422d8a02596efc`](https://explorer-studio.genlayer.com/tx/0xfefafc859f4509ec801e93f5f167d283d5c88f650f1bcdaa09422d8a02596efc)
- Registry wiring: [`0x03a45b4dbebd5f87e2ea1c81efd1fbc5720606a084b6147872ab1875396b309f`](https://explorer-studio.genlayer.com/tx/0x03a45b4dbebd5f87e2ea1c81efd1fbc5720606a084b6147872ab1875396b309f)

Finalized readback confirmed the two-way Registry/Vault pointers, minimum
review window `1200`, maximum review window `7776000`, per-reviewer cooldown
`300`, hourly epoch `3600`, normal capacity `32`, final-window reserve `4`, and
chain ID `61999`.

## Live results

| Control | Commitment | Final state | Key transaction |
| --- | ---: | --- | --- |
| Rejected payable URL | no ID consumed | full `0.0001 GEN` credited and withdrawn | [rejection](https://explorer-studio.genlayer.com/tx/0xdbd5e7197bb2a41da45157a1c2597af459bf7a592d460c0a6cd470efa5c9c255), [withdrawal](https://explorer-studio.genlayer.com/tx/0x557c82110299e1eb71b37c461159db7640d910e497c378cdeef054ee6545c40d) |
| Expiry | `0` | `EXPIRED_UNRESOLVED`, issuer withdrew | [review](https://explorer-studio.genlayer.com/tx/0x0e60ebf72624b7a34d4ec18c78ca509e7041ed388579f12edc6b2414fdcf9ac8), [expire](https://explorer-studio.genlayer.com/tx/0xece992213e48189ac3df8f46ece3036bab293466eaff13f47ecbdd08aa54b6e6), [withdrawal](https://explorer-studio.genlayer.com/tx/0xb3bc8c04c1f898c97bddbabbc7290595935d680d7ca86b97c7f3cd4a2bd68b0d) |
| Fulfilled | `1` | `FULFILLED`, issuer withdrew | [withdrawal](https://explorer-studio.genlayer.com/tx/0x41b7b44f22e5aaa8c70cb34fee689f119513eaa9ccd42fd57385ca74b0bf9e87) |
| Breached | `2` | `BREACHED`, remedy credited | [review](https://explorer-studio.genlayer.com/tx/0x984aa91136bb73042de679f245ee50c7e7c834534a3c872e2464217b8412b8ac) |
| Inconclusive | `3` | `OPEN / INCONCLUSIVE`, bond locked | [review](https://explorer-studio.genlayer.com/tx/0xf0fb3cc1ebf4da911f492177d3a17f1180706b59add0338a9c6a5d581d03c216) |

The breached credit remains owned by remedy wallet
`0xFf203Bb65942F50CB81A8AF98c5F5bd9d8a79b54`; it was not withdrawn without
that owner's signature.

## Validator/model confirmation

The finalized breached review used `openai/gpt-5.4` for the recorded leader
and validator receipts and produced three agreeing votes. The expiry control's
independent review used `policy:prd-deepseek` and also finalized with three
agreeing votes. The inconclusive review finalized successfully under
`policy:prd-grok`; one validator receipt stopped after quorum was reached,
which is expected and did not change the finalized majority result.

## Final accounting

The final Vault balance was exactly `200000000000000` wei (`0.0002 GEN`):

- `0.0001 GEN` locked by open inconclusive commitment `3`;
- `0.0001 GEN` credited to the remedy for breached commitment `2`.

Issuer credit was zero. There was no unexplained or stranded balance.

## Verification gates

- Direct tests: `9 passed`.
- Simulator/economic tests: `89 passed`.
- Core tests: `9 passed`.
- Browser tests: `40 passed` across desktop and mobile projects.
- Mutation suite: `49/49 killed`, `0 survived`.
- Type check, lint, unit checks, production build, schema check, and release
  consistency check passed.

Machine-readable lifecycle evidence is stored alongside this report in the
`evidence/live_v4_final_*.json` files.
