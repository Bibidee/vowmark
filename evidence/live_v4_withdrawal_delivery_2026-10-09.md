# V4 canary withdrawal delivery audit (2026-10-09)

> Historical canary report for the superseded V4 pair. The remedy-wallet
> signature was later completed on the current production pair; see
> [`live_v4_final_submission_2026-10-10.md`](live_v4_final_submission_2026-10-10.md).

Scope: historical Studionet canary only. These observations do **not** prove
that the corrected URL-validation bytecode is deployed.

## Receipt observations

Read-only `genlayer-js@0.9.0` `getTransaction` calls against
`https://studio.genlayer.com/api` returned the following finalized consensus
receipts. Each leader receipt reported `execution_result=SUCCESS`; each parent
receipt exposed one external message (`messageType=0`, `onAcceptance=false`),
and each leader's `pending_transactions` reported `is_eth_send=true`,
`on=finalized`.

| Cause | Parent receipt | Emitted destination | Emitted native value | Proven status |
| --- | --- | --- | ---: | --- |
| Fulfilled #1 | [0xfddd58…9d7d](https://explorer-studio.genlayer.com/tx/0xfddd58d24964d7d920533d3b223d6550265fa524565a271f1919cdea38df9d7d) | `0x794678AD7e8B6c87dAb33303a3A512c821e6De9A` | `100000000000000` wei | `WITHDRAWAL_CALL_FINALIZED`; external message emitted |
| Expired #4 | [0x58c1e1…9eb0](https://explorer-studio.genlayer.com/tx/0x58c1e1f90e039790047e236459d826a093e038b4a7b04c1db6cf1fc90de69eb0) | `0x794678AD7e8B6c87dAb33303a3A512c821e6De9A` | `100000000000000` wei | `WITHDRAWAL_CALL_FINALIZED`; external message emitted |

Neither observation is labeled `EXTERNAL_TRANSFER_DELIVERED`. The pinned SDK
does not expose `getTriggeredTransactionIds`; `gen_getTransactionReceipt` on
the configured Studio RPC returned JSON-RPC `-32601 Method not found`. The
parent receipts exposed the messages but no independently finalized child
identifier or child execution outcome. The issuer's current native balance was
readable, but no reliable before/after recipient balance snapshot at each
withdrawal was available. The issuer also paid transaction fees and may have
other activity, so a current balance cannot attribute an exact transfer.

Official [GenLayer Messages](https://docs.genlayer.com/developers/intelligent-contracts/features/messages)
and [Value Transfers](https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers)
describe external sends as finalized-only and Studio as lacking full EVM/ghost
contract parity. The [Studio limitations](https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio/limitations)
say native transfers are simulated and chain-layer behavior is not fully
modeled. The [current SDK transaction reference](https://docs.genlayer.com/api-references/genlayer-js/transactions)
documents a child-ID method, but it is unavailable in this pinned SDK and
was not substituted with an untested release change. No safe failed-transfer
callback/refund primitive was established. Debit-before-send remains in place;
an unsafe retry or refund was not added.

## Remedy wallet

BREACHED commitment #2 credited the immutable remedy
`0xFf203Bb65942F50CB81A8AF98c5F5bd9d8a79b54`. A current finalized
`Vault.get_credit(remedy)` read returned the full `100000000000000` wei.
No remedy withdrawal receipt was found in the recorded lifecycle artifacts;
the full credit still being present does not establish a historical withdrawal
to be verified. Status: **PENDING AUTHORIZED REMEDY-WALLET SIGNATURE**.

To complete this proof, the wallet owner must connect that exact address on
Studionet 61999 to the V4 canary (or a future separately authorized corrected
pair with its own credit), confirm `get_credit`, call `withdraw(100000000000000)`
on the **canary Vault** if the credit is still available, retain the returned
hash, wait for protocol `FINALIZED` plus successful execution, and re-read
credit. A separate external-delivery record or reliable balance proof is
still required before labeling funds delivered. Do not submit a second call
merely because the external result is not visible. No key or seed phrase is
requested, and no signature is performed by this audit.
