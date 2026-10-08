# VOWMARK V1 final proof matrix

This is the release matrix for the current Registry/Vault pair. Earlier deployment addresses and lifecycle artifacts are historical and superseded.

## Deployment

- Network: GenLayer Studionet, chain `61999`
- Registry: [`0xb2Fb628484f7b1C10D35d11A49B660f0aE924F37`](https://explorer-studio.genlayer.com/address/0xb2Fb628484f7b1C10D35d11A49B660f0aE924F37)
- Vault: [`0x59E28386C2804fbECCeC37D4A093b43f901af15b`](https://explorer-studio.genlayer.com/address/0x59E28386C2804fbECCeC37D4A093b43f901af15b)
- Registry deployment: [`0x4266951edc54215356e3be610912f96b04f220f4367daa5050d503c54654cd26`](https://explorer-studio.genlayer.com/tx/0x4266951edc54215356e3be610912f96b04f220f4367daa5050d503c54654cd26)
- Vault deployment: [`0x8fb975a3bcbe90e7df315a724145114c689c1b1225127fcba3bd0a63b2413235`](https://explorer-studio.genlayer.com/tx/0x8fb975a3bcbe90e7df315a724145114c689c1b1225127fcba3bd0a63b2413235)
- Finalized wiring: [`0x246e7ba161c52967b3603e121d0b8ccee6d98c8dd09c575924fcadf464fe2208`](https://explorer-studio.genlayer.com/tx/0x246e7ba161c52967b3603e121d0b8ccee6d98c8dd09c575924fcadf464fe2208)
- Unauthorized wiring rollback: [`0x390826442998c0015e272142ab203991544590505e088ba6853b216e9ca9a64d`](https://explorer-studio.genlayer.com/tx/0x390826442998c0015e272142ab203991544590505e088ba6853b216e9ca9a64d)
- Immutable-wiring negative test: [`0x05b15e9b545239e7dd82eb9ab18e9528b095751e6f7809e2f82ba85ab5d221b7`](https://explorer-studio.genlayer.com/tx/0x05b15e9b545239e7dd82eb9ab18e9528b095751e6f7809e2f82ba85ab5d221b7)
- Wiring readiness: internal `vault_ready=true` is set by the successful wiring tx and corroborated by fresh finalized registration; no public getter exists.
- Configuration readback: [`fresh_deployment_2026-10-08_pagination.md`](fresh_deployment_2026-10-08_pagination.md)
- Production frontend: final URL and Vercel deployment provenance are recorded with the final source/CI release below.

## Live proof matrix

| Case | Current result | Evidence status |
| --- | --- | --- |
| Fulfilled | `#0` `FULFILLED` | [`live_fulfilled_fresh.json`](live_fulfilled_fresh.json), finalized settlement and withdrawal to issuer; creation tx was not captured by the interrupted runner and is not invented |
| Breached | `#1` `BREACHED` | [`live_breached_fresh.json`](live_breached_fresh.json), finalized settlement to immutable remedy |
| Inconclusive / retryable | `#2` `INCONCLUSIVE`, remains `OPEN` | [`live_inconclusive_fresh.json`](live_inconclusive_fresh.json), settlement remains locked |
| Withdrawal | `100000000000000 → 0` | [`live_fulfilled_fresh.json`](live_fulfilled_fresh.json), [`0x50785bcbe88a5d1d1e61699955fc9000ef6488b97ab19c27be57451748d2f3e7`](https://explorer-studio.genlayer.com/tx/0x50785bcbe88a5d1d1e61699955fc9000ef6488b97ab19c27be57451748d2f3e7) |
| Review history | Count plus bounded pages; max page size `25`, newest-first | Contract surface, simulator pagination test and frontend load-older flow |
| Withdrawal failure boundary | Direct EOA only; sender must equal origin; debit-before-send | Vault source, Direct Mode tests and `get_withdrawal_policy()` readback |
| Settlement recovery | Finalized Registry settlement, Vault credit readback and explicit reconcile path | Fresh fulfilled/breached artifacts; simulator idempotence and retry coverage |
| Anti-grief | Automated simulator proof | Per-reviewer cooldown and hourly epoch capacity; no lifetime cap |
| Registration recovery | Automated/simulator-limited | Retry idempotence and immutable replay covered; missing-child suppression is unavailable in the simulator |
| Expired | `PENDING REAL FINAL REVIEW DEADLINE — NO EXPIRED RESULT CLAIMED` until the live candidate completes | [`live_expiry_candidate.json`](live_expiry_candidate.json); persistent runner is waiting on the enforced deadline |

Earlier lifecycle and withdrawal artifacts were produced against superseded addresses and must not be used as evidence for this release.

## Verification status

- Contract surface tests: `5 passed`
- Direct Mode custody tests: `4 passed` locally with `.venv-direct`; Linux CI remains authoritative
- Simulator-backed Registry behavior tests: `7 passed`
- Frontend typecheck, lint, board invariant test, and production build: passed
- CI, source commit and Vercel production deployment: recorded in the final release provenance after the deadline proof and final push.

## Expiry

`PENDING REAL FINAL REVIEW DEADLINE — NO EXPIRED RESULT CLAIMED`
