# VOWMARK V1 handoff status

This is a **V1-only** production handoff. It does not describe or authorize
the V4 canary on `v4-security-remediation`; V4 uses a separate 20-minute
policy. The deployed canary predates the final URL fix, which requires a new
authorized Registry/Vault pair and lifecycle evidence.

VOWMARK V1 is deployed on GenLayer Studionet 61999. The final frontend URL and source/CI provenance are recorded below after the release freeze. The canonical deployment and evidence are documented in [`evidence/FINAL_PROOF_MATRIX.md`](evidence/FINAL_PROOF_MATRIX.md).

## Canonical deployment

- Registry: [`0x3Be513bB6CAe652826A6092C0715AF39E7189c71`](https://explorer-studio.genlayer.com/address/0x3Be513bB6CAe652826A6092C0715AF39E7189c71)
- Vault: [`0xf8D89f89aD160546780eD76Cd64C550d91bAf501`](https://explorer-studio.genlayer.com/address/0xf8D89f89aD160546780eD76Cd64C550d91bAf501)
- Registry deployment: [`0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1`](https://explorer-studio.genlayer.com/tx/0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1)
- Vault deployment: [`0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938`](https://explorer-studio.genlayer.com/tx/0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938)
- Wiring: [`0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e`](https://explorer-studio.genlayer.com/tx/0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e)
- Configuration readback: [`fresh_deployment_2026-10-08_pagination.md`](evidence/fresh_deployment_2026-10-08_pagination.md)
- Frontend: [`the-vowmark.vercel.app`](https://the-vowmark.vercel.app/) points to Vercel deployment [`dpl_E7BqsrfqrsiPEEwEGnGS2iqQBXsd`](https://vercel.com/bibidees-projects/vowmark/E7BqsrfqrsiPEEwEGnGS2iqQBXsd), state `READY`, target `production`.
- Application source: [`8dbb131958d28f87d9f618a9d2bbd09744a6986b`](https://github.com/Bibidee/vowmark/commit/8dbb131958d28f87d9f618a9d2bbd09744a6986b); the manual Vercel deployment was created from this checked-out SHA.

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

- Contract surface tests: `20 passed`
- Direct Mode custody tests: `4 passed`
- Simulator-backed Registry behavior tests: `11 passed`
- Frontend typecheck, lint, board invariant test, and production build: passed
- Final CI: [`37777191132`](https://github.com/Bibidee/vowmark/actions/runs/37777191132), all four jobs green for the application SHA.
- Production route checks: `/`, `/issue`, `/activity`, `/commitment/0`, and `/issuer/0x794678AD7e8B6c87dAb33303a3A512c821e6De9A` all returned HTTP `200` through the final alias.

## Honest limitation

Fresh final-pair expiry candidate #6 completed after its real 15-minute deadline; the finalized evidence is in `evidence/live_expired_final.json`. The simulator cannot suppress the first finalized child message, so registration recovery remains proven only as immutable, duplicate-safe retry replay after automatic delivery rather than a missing-child injection.

## Separate V4 canary (not V1 production)

V4's historical Studionet Registry `0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26`
and Vault `0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C` were wired by
finalized transaction
[`0xc2c4bfae…b36f4`](https://explorer-studio.genlayer.com/tx/0xc2c4bfae0fdb7f0b8c86459a4a5c8bb9ad61f6970fe642a6383fa8a1f60b36f4).
The source matches the `9d4082c` snapshot retained through `5e6a917`.
The latest verified pre-fix Preview is
[`vowmark-7xflueq8o-bibidees-projects.vercel.app`](https://vowmark-7xflueq8o-bibidees-projects.vercel.app/),
deployment `dpl_2KmXJ98a1UeATTvDnQ1FkzszKbwq`. The final numeric-host fix
is **not** deployed at those addresses. Live lifecycle evidence is in
[`evidence/live_v4_smoke_2026-10-09.md`](evidence/live_v4_smoke_2026-10-09.md).
Issuer withdrawal calls prove parent finality and external-message emission,
not independent delivery; see
[`evidence/live_v4_withdrawal_delivery_2026-10-09.md`](evidence/live_v4_withdrawal_delivery_2026-10-09.md).
