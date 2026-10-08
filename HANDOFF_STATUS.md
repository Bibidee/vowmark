# VOWMARK V1 handoff status

VOWMARK V1 is deployed on GenLayer Studionet 61999. The final frontend URL and source/CI provenance are recorded below after the release freeze. The canonical deployment and evidence are documented in [`evidence/FINAL_PROOF_MATRIX.md`](evidence/FINAL_PROOF_MATRIX.md).

## Canonical deployment

- Registry: [`0x3Be513bB6CAe652826A6092C0715AF39E7189c71`](https://explorer-studio.genlayer.com/address/0x3Be513bB6CAe652826A6092C0715AF39E7189c71)
- Vault: [`0xf8D89f89aD160546780eD76Cd64C550d91bAf501`](https://explorer-studio.genlayer.com/address/0xf8D89f89aD160546780eD76Cd64C550d91bAf501)
- Registry deployment: [`0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1`](https://explorer-studio.genlayer.com/tx/0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1)
- Vault deployment: [`0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938`](https://explorer-studio.genlayer.com/tx/0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938)
- Wiring: [`0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e`](https://explorer-studio.genlayer.com/tx/0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e)
- Configuration readback: [`fresh_deployment_2026-10-08_pagination.md`](evidence/fresh_deployment_2026-10-08_pagination.md)
- Frontend: final deployment URL and immutable deployment ID recorded after the final source commit is pushed.
- Application source: final release commit recorded after the expiry evidence is completed.

## Release state

- Frontend defaults target the canonical Registry and Vault.
- The transaction rail uses explicit `IDLE`, `SUBMITTED`, `ACCEPTED`, `FINALIZED`, `FAILED`, and `UNDETERMINED` stages; human-readable detail cannot activate finality.
- The issue flow persists its hash immediately, extracts the canonical returned commitment ID only after successful finality, verifies all Vault issuance terms, and exposes recoverable Registry registration retry from Issue and Activity.
- Public reads use the configured Studionet RPC and normalize GenLayer map readbacks before rendering; wallet injection remains write-only.
- Reviewer cooldown is isolated per reviewer, with a per-hour epoch capacity that does not impose a permanent lifetime attempt cap.
- Review liveness is permissioned rather than guaranteed convergence: a changed snapshot, per-reviewer cooldown, epoch capacity and final deadline still constrain retries, and no validator availability or conclusive verdict is promised.
- `get_issuance` exposes the full statement and verification rule for exact readback.
- `get_review_count` plus bounded `get_reviews(start, limit)` provide newest-first review history without unbounded read payloads; the contract caps each page at 25 records.
- Timing policy is fixed at a 15-minute minimum review window, 5-minute same-reviewer cooldown, 1-hour capacity epoch, 32 accepted attempts per epoch and 90-day maximum review window.
- Withdrawals are intentionally bounded to the supported direct-EOA path (`sender_address == origin_address`); credit is debited before the finalized external transfer.
- The app logo remains present in the frontend.

## Verification

- Contract surface tests: `5 passed`
- Direct Mode custody tests: `4 passed`
- Simulator-backed Registry behavior tests: `7 passed`
- Frontend typecheck, lint, and production build: passed
- Final CI and production deployment: recorded after the final source commit is pushed.
- Production route checks: recorded against the final deployment.

## Honest limitation

Fresh final-pair expiry candidate #6 completed after its real 15-minute deadline; the finalized evidence is in `evidence/live_expired_final.json`. The simulator cannot suppress the first finalized child message, so registration recovery remains proven only as immutable, duplicate-safe retry replay after automatic delivery rather than a missing-child injection.
