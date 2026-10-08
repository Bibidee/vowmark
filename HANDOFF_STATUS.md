# VOWMARK V1 handoff status

VOWMARK V1 is deployed on GenLayer Studionet 61999 and published at [the-vowmark.vercel.app](https://the-vowmark.vercel.app). The canonical deployment and evidence are documented in [`evidence/FINAL_PROOF_MATRIX.md`](evidence/FINAL_PROOF_MATRIX.md).

## Canonical deployment

- Registry: [`0xd1F0B0Ac5E148e6b16e6684dcb01C3a68B842f2d`](https://explorer-studio.genlayer.com/address/0xd1F0B0Ac5E148e6b16e6684dcb01C3a68B842f2d)
- Vault: [`0x925Dd2d3fd74b4C8d5205FEA48131d5fEF3e83ff`](https://explorer-studio.genlayer.com/address/0x925Dd2d3fd74b4C8d5205FEA48131d5fEF3e83ff)
- Registry deployment: [`0xee41807eaf5c63dd7d0eede4e0bfc4573b0daaa7b235b7fd84e7eec95febc8ea`](https://explorer-studio.genlayer.com/tx/0xee41807eaf5c63dd7d0eede4e0bfc4573b0daaa7b235b7fd84e7eec95febc8ea)
- Vault deployment: [`0x109d8012bfaab6561e112492e7808eb72f1bd0b7b1ef23095fde8adb7220d36c`](https://explorer-studio.genlayer.com/tx/0x109d8012bfaab6561e112492e7808eb72f1bd0b7b1ef23095fde8adb7220d36c)
- Wiring: [`0x3001c417be1cb12530fa1fe1163d10e8cd899f1341f41a97494fe867de76c5ee`](https://explorer-studio.genlayer.com/tx/0x3001c417be1cb12530fa1fe1163d10e8cd899f1341f41a97494fe867de76c5ee)
- Frontend: [the-vowmark.vercel.app](https://the-vowmark.vercel.app), aliased to the fresh Vercel production deployment [`dpl_2NpFUVUW4rg1MVyHuKhQUf67Sr5k`](https://vercel.com/bibidees-projects/vowmark/2NpFUVUW4rg1MVyHuKhQUf67Sr5k)
- Application source: [`d4c4f87`](https://github.com/Bibidee/vowmark/commit/d4c4f87e67ff04c138fb87d2dc06c9c9deeb29b3) on `main`

## Release state

- Frontend defaults target the canonical Registry and Vault.
- The transaction rail uses explicit `IDLE`, `SUBMITTED`, `ACCEPTED`, `FINALIZED`, `FAILED`, and `UNDETERMINED` stages; human-readable detail cannot activate finality.
- The issue flow persists its hash immediately, extracts the canonical returned commitment ID only after successful finality, verifies all Vault issuance terms, and exposes recoverable Registry registration retry from Issue and Activity.
- Public reads use the configured Studionet RPC and normalize GenLayer map readbacks before rendering; wallet injection remains write-only.
- Reviewer cooldown is isolated per reviewer, with a per-hour epoch capacity that does not impose a permanent lifetime attempt cap.
- `get_issuance` exposes the full statement and verification rule for exact readback.
- The app logo remains present in the frontend.

## Verification

- Contract surface tests: `5 passed`
- Direct Mode custody tests: `4 passed`
- Simulator-backed Registry behavior tests: `6 passed`
- Frontend typecheck, lint, and production build: passed
- Final CI: [passed](https://github.com/Bibidee/vowmark/actions/runs/37745086746) for `d4c4f87`
- Production deployment: ready at [the-vowmark.vercel.app](https://the-vowmark.vercel.app)
- Production route checks: `/`, `/issue`, `/activity`, and `/commitment/6` returned HTTP 200

## Honest limitation

The exact expiry status is `PENDING REAL FINAL REVIEW DEADLINE — NO EXPIRED RESULT CLAIMED`. Earlier lifecycle and withdrawal artifacts belong to the superseded deployment and are not evidence for the fresh addresses. The simulator cannot suppress the first finalized child message, so registration recovery remains proven only as immutable, duplicate-safe retry replay after automatic delivery rather than a missing-child injection.
