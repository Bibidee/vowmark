# VOWMARK V1 handoff status

VOWMARK V1 is deployed on GenLayer Studionet 61999. The final frontend URL and source/CI provenance are recorded below after the release freeze. The canonical deployment and evidence are documented in [`evidence/FINAL_PROOF_MATRIX.md`](evidence/FINAL_PROOF_MATRIX.md).

## Canonical deployment

- Registry: [`0xb2Fb628484f7b1C10D35d11A49B660f0aE924F37`](https://explorer-studio.genlayer.com/address/0xb2Fb628484f7b1C10D35d11A49B660f0aE924F37)
- Vault: [`0x59E28386C2804fbECCeC37D4A093b43f901af15b`](https://explorer-studio.genlayer.com/address/0x59E28386C2804fbECCeC37D4A093b43f901af15b)
- Registry deployment: [`0x4266951edc54215356e3be610912f96b04f220f4367daa5050d503c54654cd26`](https://explorer-studio.genlayer.com/tx/0x4266951edc54215356e3be610912f96b04f220f4367daa5050d503c54654cd26)
- Vault deployment: [`0x8fb975a3bcbe90e7df315a724145114c689c1b1225127fcba3bd0a63b2413235`](https://explorer-studio.genlayer.com/tx/0x8fb975a3bcbe90e7df315a724145114c689c1b1225127fcba3bd0a63b2413235)
- Wiring: [`0x246e7ba161c52967b3603e121d0b8ccee6d98c8dd09c575924fcadf464fe2208`](https://explorer-studio.genlayer.com/tx/0x246e7ba161c52967b3603e121d0b8ccee6d98c8dd09c575924fcadf464fe2208)
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

The exact expiry status is `PENDING REAL FINAL REVIEW DEADLINE — NO EXPIRED RESULT CLAIMED`. Earlier lifecycle and withdrawal artifacts belong to the superseded deployment and are not evidence for the fresh addresses. The simulator cannot suppress the first finalized child message, so registration recovery remains proven only as immutable, duplicate-safe retry replay after automatic delivery rather than a missing-child injection.
