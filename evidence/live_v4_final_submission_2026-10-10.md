# VOWMARK V4 final submission evidence — 2026-10-10

## Scope and release identity

This is the current production evidence for VOWMARK V4 on GenLayer Studionet
(`61999`). It supersedes the earlier V4 pair as the production reference, but
does not rewrite any historical transaction report.

- Production: [`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/)
- Vercel deployment: `dpl_FUeNAXRgLLzKoUCUtb4QSNCXR9Ez`
- Frontend source: [`v4-final-certification`](https://github.com/Bibidee/vowmark/tree/v4-final-certification), commit [`67afe8ef5b029bf54ef6f9cf18f811881532c240`](https://github.com/Bibidee/vowmark/tree/67afe8ef5b029bf54ef6f9cf18f811881532c240)
- Registry: [`0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707`](https://explorer-studio.genlayer.com/address/0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707)
- Vault: [`0x7cd9B38266eC92024c938354c498245D34314bd7`](https://explorer-studio.genlayer.com/address/0x7cd9B38266eC92024c938354c498245D34314bd7)
- Registry deployment: [`0x5701dc1cc4e401ba1d2fac4c33f7569066cb0b5a09640399ba668137472909a6`](https://explorer-studio.genlayer.com/tx/0x5701dc1cc4e401ba1d2fac4c33f7569066cb0b5a09640399ba668137472909a6)
- Vault deployment: [`0xf51dc5f59ecd5f13993a559d810e9266138227f8d788ef0d71d7a70daa375a33`](https://explorer-studio.genlayer.com/tx/0xf51dc5f59ecd5f13993a559d810e9266138227f8d788ef0d71d7a70daa375a33)
- Registry/Vault wiring: [`0x4617ff6909478706602912b3ea135c1b234088d1c080486d8d5407218aa92a2b`](https://explorer-studio.genlayer.com/tx/0x4617ff6909478706602912b3ea135c1b234088d1c080486d8d5407218aa92a2b)

The production bundle contains the current Registry, Vault and
`explorer-studio.genlayer.com` configuration. Vercel reports the deployment as
`READY` with target `production`. The available RPC evidence confirms the
two-way Registry/Vault pointers and the policy values below. A source-verified
bytecode artifact was not available from the configured Studio tooling, so the
live contracts are not described as cryptographically source-attested solely
from the Git commit.

## Finalized configuration readback

| Setting | Finalized value |
| --- | ---: |
| Network | GenLayer Studionet |
| Chain ID | `61999` |
| Minimum review window | `1200` seconds / 20 minutes |
| Same-reviewer cooldown | `300` seconds / 5 minutes |
| Review cooldown scope | Per reviewer |
| Review epoch | `3600` seconds / 1 hour |
| Normal attempts per epoch | `32` |
| Late reserve window | `300` seconds / 5 minutes |
| Late reserve attempts | `4` |
| Maximum review window | `7776000` seconds / 90 days |
| Registry → Vault | `0x7cd9B38266eC92024c938354c498245D34314bd7` |
| Vault → Registry | `0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707` |

## Live lifecycle evidence

Each bond was `100000000000000` wei (`0.0001 GEN`). All listed transactions
were finalized before the state readbacks were recorded.

| Record | Result | Evidence |
| ---: | --- | --- |
| `#0` | First review `INCONCLUSIVE`; later `EXPIRED_UNRESOLVED` after the real deadline | [create](https://explorer-studio.genlayer.com/tx/0x69d37a22f65c62ae48869012c72989fb2675d44bbcbce7de071064634b79b207), [review](https://explorer-studio.genlayer.com/tx/0x9e2de7c1adcc126dee1e5d2a1b068cc7ec23f0e57d1c0fb37029595eaf043018), [expire](https://explorer-studio.genlayer.com/tx/0xec1f1ede30807d13107a5a236c93177d7a1e3fd89fd3ea837d14cbcf29697dcd), [reconcile](https://explorer-studio.genlayer.com/tx/0x36ca88fe7db63be804c53ae75003eb936df6fb878a40e695a7ab6e506df66668), [issuer withdrawal](https://explorer-studio.genlayer.com/tx/0x75b85a59f0356f4acf665ad4cb910787c23012b81c3d4b9d8562060f0a642091) |
| `#1` | `FULFILLED` | [create](https://explorer-studio.genlayer.com/tx/0xf77d0c0ae259b58b39aba521155ecf1cd950e724fbf8663001e7637499296604), [review](https://explorer-studio.genlayer.com/tx/0xcee8606360e138a0fed5f58cb61a72a33e2868c03b2a83ae8e2c8c441eea2233), [reconcile](https://explorer-studio.genlayer.com/tx/0x39d4f174220c87fe291c6343cef112fe190b63a14ae99e497cca9c4fa93dd969), [issuer withdrawal](https://explorer-studio.genlayer.com/tx/0x1ee27bbbe61288fe98819313adb92266649a7c4ff12603fb78ec7b4bc6843f6d) |
| `#2` | `BREACHED`; remedy credit confirmed, then withdrawn by the remedy wallet | [create](https://explorer-studio.genlayer.com/tx/0xc72c7341393bfa59c6cf1d4d0d833a7170d00e418a2608000321bc3d6019a8bd), [review](https://explorer-studio.genlayer.com/tx/0x7550f3549b61a6c342815ba666406e340c6f8ea6d6de4b86a46bd45bd66c2c1f), [reconcile](https://explorer-studio.genlayer.com/tx/0xdfa66b87a32f04dce83965c57448816ca187ae226a20d9d9cdb77d0f588b2bed), [remedy-wallet withdrawal](https://explorer-studio.genlayer.com/tx/0x524ae773a04952d8e39f16ce9640166d42a097146d0be9fa1e280ca11d6d46cd) |

The `#0` path is the live inconclusive control and the same record's later
deadline transition is the live expiry control. The live review receipts
finalized with the expected VOWMARK verdicts. The pinned Studio SDK/runtime
does not expose a complete independently queryable child-transaction/model
roster for every review, so this report claims finalized validator decisions,
not universal success or an exhaustive model identity list.

## Final custody reconciliation

Read-only state was reread from the current Vault after the remedy wallet's
withdrawal finalized (`2026-10-10T03:01:52Z`).

| Account / liability | Amount |
| --- | ---: |
| Vault native GEN balance | `0 GEN` |
| Locked bonds | `0 GEN` |
| Issuer withdrawable credit | `0 GEN` |
| Remedy withdrawable credit | `0 GEN` |
| Outstanding withdrawable credits | `0 GEN` |
| Accounted liabilities (`locked bonds + credits`) | `0 GEN` |
| Unexplained asset/liability difference | `0 GEN` |

The remedy wallet was `0xFf203Bb65942F50CB81A8AF98c5F5bd9d8a79b54`. Its
finalized withdrawal transaction is
[`0x524ae773…d6d46cd`](https://explorer-studio.genlayer.com/tx/0x524ae773a04952d8e39f16ce9640166d42a097146d0be9fa1e280ca11d6d46cd),
and the production Activity page displayed `FINALIZED / FINALIZED EXECUTION
OK`. The Vault credit readback is zero after withdrawal. GenLayer's available
Studio receipts expose the finalized parent/external-message boundary but not
a reliable child-delivery receipt; this is recorded as a platform observability
limitation, not as an unexplained Vault liability.

The invalid-payable recovery evidence is preserved in
[`live_v4_final_rejected_value_2026-10-09.json`](live_v4_final_rejected_value_2026-10-09.json),
but that transaction belongs to the superseded
`0x3cA983…` / `0xE9e153…` pair. It is historical evidence for the rejection
path and is not attributed to the current production contracts.

## Manual Brave smoke test

The production application was inspected through Brave Computer Use using the
connected remedy wallet, without creating a new commitment or signing another
transaction.

| Surface | Result | Observation |
| --- | --- | --- |
| Homepage / public board | PASS | Studionet `61999`; three current records indexed; `#0`, `#1`, `#2` visible under recently resolved. |
| `/issue` | PASS | Form renders all five stages, V4 timing copy, source-kind selector and wallet state. |
| Input validation | PASS | A 15-minute deadline was blocked by the 20-minute guard; a `https://127.1/...` evidence URL was blocked as a non-public numeric host. No transaction was sent. |
| `/commitment/0` | PASS | Shows `EXPIRED UNRESOLVED`, initial `INCONCLUSIVE`, terminal settlement and zero finalized credit. |
| `/commitment/1` | PASS | Shows `FULFILLED`, finalized settlement and zero finalized credit. |
| `/commitment/2` | PASS | Shows `BREACHED`, remedy settlement to `0xff20…9b54`, and zero finalized credit after withdrawal. |
| Issuer page | PASS | Shows three indexed records: one fulfilled, one breached and one expired unresolved. |
| `/activity` | PASS | Shows the remedy-wallet withdrawal as `FINALIZED / FINALIZED EXECUTION OK` with its explorer hash. |
| Wallet/configuration | PASS | Connected wallet displayed as `0xff20…9b54`; header displayed `STUDIONET / 61999`; explorer links used the Studio explorer. |

Screenshots were captured for the production board, issue form and breached
terminal record during the run. No browser error was observed; record pages
needed their normal asynchronous RPC settling interval before the final
readback appeared.

## Registration stress result

The focused simulator regression ran on the current source and passed. It
registers commitment `#1` before `#0`, verifies the newer record is public while
the older ID is missing, checks recent-list and paginated reads, checks issuer
pagination, retries the duplicate without changing count or Vault credit, then
delivers the delayed older registration and verifies convergence.

The listing algorithm scans backward from `registration_scan_upper_bound` and
returns only registered records. The tested gap is safe and bounded by the
configured page size. No material execution failure or resource exhaustion was
reproduced; very large sparse ID gaps remain a practical gas/step-cost
limitation of backward scanning, not a demonstrated exploitable vulnerability.
No contract change or redeployment was made for this concern.

## CI and security disposition

- Exact-head GitHub Actions run: [37987011353](https://github.com/Bibidee/vowmark/actions/runs/37987011353) — passed.
- Simulator: `90 passed`.
- Direct Mode: `9 passed`.
- Mutation inventory: `49/49` valid mutants killed.
- Browser suite: `44 passed`.
- Python surface: `10 passed`, `3` environment skips.
- V4 release consistency: passed.
- Production-only dependency audit: passed with zero findings.

The full development dependency tree still reports the disclosed unpatched
`braces` advisory through Next lint tooling; no patched upstream release was
available and the suggested major downgrade was not safe. GenLayer's failed
child-transfer recovery/receipt limitation and the Windows Direct Mode host
SDK limitation remain disclosed platform/tooling boundaries. Neither creates a
current Vault liability.
