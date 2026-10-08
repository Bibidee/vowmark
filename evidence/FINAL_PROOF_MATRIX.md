# VOWMARK V1 final proof matrix

This is the release matrix for the fresh Registry/Vault pair. Earlier deployment addresses and lifecycle artifacts are historical and superseded because the Registry source changed.

## Deployment

- Network: GenLayer Studionet, chain `61999`
- Registry: [`0xd1F0B0Ac5E148e6b16e6684dcb01C3a68B842f2d`](https://explorer-studio.genlayer.com/address/0xd1F0B0Ac5E148e6b16e6684dcb01C3a68B842f2d)
- Vault: [`0x925Dd2d3fd74b4C8d5205FEA48131d5fEF3e83ff`](https://explorer-studio.genlayer.com/address/0x925Dd2d3fd74b4C8d5205FEA48131d5fEF3e83ff)
- Registry deployment: [`0xee41807eaf5c63dd7d0eede4e0bfc4573b0daaa7b235b7fd84e7eec95febc8ea`](https://explorer-studio.genlayer.com/tx/0xee41807eaf5c63dd7d0eede4e0bfc4573b0daaa7b235b7fd84e7eec95febc8ea)
- Vault deployment: [`0x109d8012bfaab6561e112492e7808eb72f1bd0b7b1ef23095fde8adb7220d36c`](https://explorer-studio.genlayer.com/tx/0x109d8012bfaab6561e112492e7808eb72f1bd0b7b1ef23095fde8adb7220d36c)
- Finalized wiring: [`0x3001c417be1cb12530fa1fe1163d10e8cd899f1341f41a97494fe867de76c5ee`](https://explorer-studio.genlayer.com/tx/0x3001c417be1cb12530fa1fe1163d10e8cd899f1341f41a97494fe867de76c5ee)
- Unauthorized wiring rollback: [`0xadce639ca8a9b05cf6f485ad3ad6f2256a5c5391a100c0925b46c4abd5055af5`](https://explorer-studio.genlayer.com/tx/0xadce639ca8a9b05cf6f485ad3ad6f2256a5c5391a100c0925b46c4abd5055af5)
- Configuration readback: [`fresh_deployment_2026-10-08.md`](fresh_deployment_2026-10-08.md)
- Production frontend: [the-vowmark.vercel.app](https://the-vowmark.vercel.app), fresh deployment pending

## Live proof matrix

| Case | Fresh result | Evidence status |
| --- | --- | --- |
| Fulfilled | `#6` `FULFILLED` | [`live_fulfilled_fresh.json`](live_fulfilled_fresh.json), settled to issuer |
| Breached | `#4` `BREACHED` | [`live_breached_fresh.json`](live_breached_fresh.json), settled to remedy |
| Inconclusive / retryable | `#5` `INCONCLUSIVE`, remains `OPEN` | [`live_inconclusive_fresh.json`](live_inconclusive_fresh.json), no settlement |
| Withdrawal | `100000000000000 → 0` | [`live_fulfilled_fresh.json`](live_fulfilled_fresh.json), [`0x7b692dd5f70225e133abfaa91100896dd146fbac4d29b33c64a6e897fa82a620`](https://explorer-studio.genlayer.com/tx/0x7b692dd5f70225e133abfaa91100896dd146fbac4d29b33c64a6e897fa82a620) |
| Anti-grief | Automated simulator proof | 32 fresh reviewers fill one hourly epoch; next hour accepts another reviewer; no lifetime cap |
| Registration recovery | Automated/simulator-limited | Retry idempotence and immutable replay covered; missing-child suppression is unavailable in the simulator |
| Expired | `PENDING REAL FINAL REVIEW DEADLINE — NO EXPIRED RESULT CLAIMED` | No early expiry claim |

Earlier `live_fulfilled_final.json`, `live_breached_final.json`, `live_inconclusive_final.json`, `live_antigrief_final.json` and withdrawal hashes were produced against the superseded addresses and must not be used as evidence for this release.

## Verification status

- Contract surface tests: `5 passed`
- Direct Mode custody tests: `4 passed` locally with `.venv-direct`; Linux CI remains authoritative
- Simulator-backed Registry behavior tests: `6 passed`
- Frontend typecheck, lint, board invariant test, and production build: passed
- CI: rerun required after final edits
- Production: fresh frontend deployment required after commit

## Expiry

`PENDING REAL FINAL REVIEW DEADLINE — NO EXPIRED RESULT CLAIMED`
