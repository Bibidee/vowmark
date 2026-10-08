# Fresh Studionet deployment readback — 2026-10-08

This artifact supersedes the earlier Registry/Vault pair because `vowmark_registry.py` changed. It records only finalized transactions and direct configuration readbacks observed from GenLayer Studionet chain `61999`.

## Canonical addresses

- Registry: [`0xd1F0B0Ac5E148e6b16e6684dcb01C3a68B842f2d`](https://explorer-studio.genlayer.com/address/0xd1F0B0Ac5E148e6b16e6684dcb01C3a68B842f2d)
- Vault: [`0x925Dd2d3fd74b4C8d5205FEA48131d5fEF3e83ff`](https://explorer-studio.genlayer.com/address/0x925Dd2d3fd74b4C8d5205FEA48131d5fEF3e83ff)

## Finalized transactions

- Registry deployment: [`0xee41807eaf5c63dd7d0eede4e0bfc4573b0daaa7b235b7fd84e7eec95febc8ea`](https://explorer-studio.genlayer.com/tx/0xee41807eaf5c63dd7d0eede4e0bfc4573b0daaa7b235b7fd84e7eec95febc8ea)
- Vault deployment: [`0x109d8012bfaab6561e112492e7808eb72f1bd0b7b1ef23095fde8adb7220d36c`](https://explorer-studio.genlayer.com/tx/0x109d8012bfaab6561e112492e7808eb72f1bd0b7b1ef23095fde8adb7220d36c)
- Registry-to-Vault wiring: [`0x3001c417be1cb12530fa1fe1163d10e8cd899f1341f41a97494fe867de76c5ee`](https://explorer-studio.genlayer.com/tx/0x3001c417be1cb12530fa1fe1163d10e8cd899f1341f41a97494fe867de76c5ee)
- Unauthorized rewiring negative test: [`0xadce639ca8a9b05cf6f485ad3ad6f2256a5c5391a100c0925b46c4abd5055af5`](https://explorer-studio.genlayer.com/tx/0xadce639ca8a9b05cf6f485ad3ad6f2256a5c5391a100c0925b46c4abd5055af5), finalized rollback `only the deployer may finish initial wiring`.

Every transaction above was checked with the CLI's `FINALIZED` receipt wait. The successful deployment/wiring receipts had `leader execution_result: SUCCESS`, decoded `return`, and majority-agree consensus. The negative test had a finalized rollback and did not change Registry state.

## Configuration readback

`Registry.get_config()` returned:

```text
chain_id: 61999
network: GenLayer Studionet
vault_address: 0x925dd2d3fd74b4c8d5205fea48131d5fef3e83ff
min_review_window: 7200
max_review_window: 7776000
retry_cooldown: 3600
review_epoch_seconds: 3600
max_review_attempts_per_epoch: 32
review_attempts_are_not_lifetime_capped: true
review_cooldown_scope: per_reviewer
```

`Vault.get_registry()` returned `0xd1f0b0ac5e148e6b16e6684dcb01c3a68b842f2d`.

The first attempted Registry deployment used invalid `address#` CLI syntax and finalized with constructor error; it is intentionally not a canonical address or deployment artifact. No frontend or document points to it.
