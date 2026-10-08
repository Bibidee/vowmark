# Fresh Studionet deployment readback — 2026-10-08

This is the canonical deployment artifact for the final bounded-review-history and short-timing release. The earlier pagination-only pair is superseded because the Registry timing constants changed and a fresh pair was required.

## Network and addresses

- Network: GenLayer Studionet, chain `61999`
- Registry: [`0x3Be513bB6CAe652826A6092C0715AF39E7189c71`](https://explorer-studio.genlayer.com/address/0x3Be513bB6CAe652826A6092C0715AF39E7189c71)
- Vault: [`0xf8D89f89aD160546780eD76Cd64C550d91bAf501`](https://explorer-studio.genlayer.com/address/0xf8D89f89aD160546780eD76Cd64C550d91bAf501)

## Finalized deployment transactions

- Registry deployment: [`0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1`](https://explorer-studio.genlayer.com/tx/0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1)
- Vault deployment: [`0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938`](https://explorer-studio.genlayer.com/tx/0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938)
- Registry-to-Vault wiring: [`0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e`](https://explorer-studio.genlayer.com/tx/0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e)
- Unauthorized wiring attempt: [`0x19f2a8303e4b7e5ca29a493bb421ba35380f68d078c71e6ac137a2b8652f68f9`](https://explorer-studio.genlayer.com/tx/0x19f2a8303e4b7e5ca29a493bb421ba35380f68d078c71e6ac137a2b8652f68f9), finalized execution error with `only the deployer may finish initial wiring` and no state change.
- Second wiring attempt after immutable setup: [`0xb9440b627037f456d914a72a71174204aaefc3c8c292491773296e7bad389f10`](https://explorer-studio.genlayer.com/tx/0xb9440b627037f456d914a72a71174204aaefc3c8c292491773296e7bad389f10), finalized execution error with `vault wiring is already immutable`.

Successful deployment and wiring transactions were checked as finalized with successful leader execution and consensus. The negative transactions were checked as finalized execution errors and did not alter canonical wiring.

`vault_ready` is an internal Registry flag rather than a public getter. It is set to `true` by the successful finalized wiring transaction and is corroborated by the fresh finalized issuance/registration flows; subsequent wiring is rejected as immutable.

## Configuration readback

`Registry.get_config()` returned:

```text
chain_id: 61999
network: GenLayer Studionet
vault_address: 0xf8d89f89ad160546780ed76cd64c550d91baf501
min_review_window: 900
max_review_window: 7776000
retry_cooldown: 300
review_epoch_seconds: 3600
max_review_attempts_per_epoch: 32
max_review_page: 25
review_attempts_are_not_lifetime_capped: true
review_cooldown_scope: per_reviewer
```

`Vault.get_registry()` returned `0x3be513bb6cae652826a6092c0715af39e7189c71`.

`Vault.get_withdrawal_policy()` returned the supported boundary: `supported_caller=direct EOA`, `requires_sender_equals_origin=true`, `delivery=external finalized transfer`, `debit_order=before transfer`.

The exact read API is `get_review_count(commitment_id)` plus `get_reviews(commitment_id, start, limit)`. The contract clamps every page to 25 records and the frontend loads older pages explicitly.
