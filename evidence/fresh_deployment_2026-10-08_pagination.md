# Fresh Studionet deployment readback — 2026-10-08

This is the canonical deployment artifact for the bounded-review-history release. It supersedes the historical `fresh_deployment_2026-10-08.md` artifact because the Registry source now exposes bounded review pages and the Vault has an explicit direct-EOA withdrawal boundary.

## Network and addresses

- Network: GenLayer Studionet, chain `61999`
- Registry: [`0xb2Fb628484f7b1C10D35d11A49B660f0aE924F37`](https://explorer-studio.genlayer.com/address/0xb2Fb628484f7b1C10D35d11A49B660f0aE924F37)
- Vault: [`0x59E28386C2804fbECCeC37D4A093b43f901af15b`](https://explorer-studio.genlayer.com/address/0x59E28386C2804fbECCeC37D4A093b43f901af15b)

## Finalized deployment transactions

- Registry deployment: [`0x4266951edc54215356e3be610912f96b04f220f4367daa5050d503c54654cd26`](https://explorer-studio.genlayer.com/tx/0x4266951edc54215356e3be610912f96b04f220f4367daa5050d503c54654cd26)
- Vault deployment: [`0x8fb975a3bcbe90e7df315a724145114c689c1b1225127fcba3bd0a63b2413235`](https://explorer-studio.genlayer.com/tx/0x8fb975a3bcbe90e7df315a724145114c689c1b1225127fcba3bd0a63b2413235)
- Registry-to-Vault wiring: [`0x246e7ba161c52967b3603e121d0b8ccee6d98c8dd09c575924fcadf464fe2208`](https://explorer-studio.genlayer.com/tx/0x246e7ba161c52967b3603e121d0b8ccee6d98c8dd09c575924fcadf464fe2208)
- Unauthorized wiring attempt: [`0x390826442998c0015e272142ab203991544590505e088ba6853b216e9ca9a64d`](https://explorer-studio.genlayer.com/tx/0x390826442998c0015e272142ab203991544590505e088ba6853b216e9ca9a64d), finalized execution error with `only the deployer may finish initial wiring` and no state change.
- Second wiring attempt after immutable setup: [`0x05b15e9b545239e7dd82eb9ab18e9528b095751e6f7809e2f82ba85ab5d221b7`](https://explorer-studio.genlayer.com/tx/0x05b15e9b545239e7dd82eb9ab18e9528b095751e6f7809e2f82ba85ab5d221b7), finalized execution error with `vault wiring is already immutable`.

Successful deployment and wiring transactions were checked as finalized with successful leader execution and consensus. The negative transactions were checked as finalized execution errors and did not alter canonical wiring.

`vault_ready` is an internal Registry flag rather than a public getter. It is set to `true` by the successful finalized wiring transaction and is corroborated by the fresh finalized issuance/registration flows; subsequent wiring is rejected as immutable.

## Configuration readback

`Registry.get_config()` returned:

```text
chain_id: 61999
network: GenLayer Studionet
vault_address: 0x59e28386c2804fbeccec37d4a093b43f901af15b
min_review_window: 7200
max_review_window: 7776000
retry_cooldown: 3600
review_epoch_seconds: 3600
max_review_attempts_per_epoch: 32
max_review_page: 25
review_attempts_are_not_lifetime_capped: true
review_cooldown_scope: per_reviewer
```

`Vault.get_registry()` returned `0xb2fb628484f7b1c10d35d11a49b660f0ae924f37`.

`Vault.get_withdrawal_policy()` returned the supported boundary: `supported_caller=direct EOA`, `requires_sender_equals_origin=true`, `delivery=external finalized transfer`, `debit_order=before transfer`.

The exact read API is `get_review_count(commitment_id)` plus `get_reviews(commitment_id, start, limit)`. The contract clamps every page to 25 records and the frontend loads older pages explicitly.
