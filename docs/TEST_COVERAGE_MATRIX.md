# VOWMARK V1 test coverage matrix

This maps every item in [`TEST_PLAN.md`](TEST_PLAN.md) to the strongest evidence currently available. Status values are intentionally exact: `AUTOMATED`, `LIVE-PROVEN`, `TOOLING-LIMITED`, `PENDING`, or `NOT-APPLICABLE`.

| # | Status | Evidence |
| ---: | --- | --- |
| 1 | AUTOMATED | Direct/contract surface creation coverage |
| 2 | TOOLING-LIMITED | Contract bounds permit up to five anchors; not separately executed |
| 3 | TOOLING-LIMITED | Zero-bond guard in Vault source and surface assertions |
| 4 | TOOLING-LIMITED | Address validation and issuer/remedy inequality in Vault |
| 5 | TOOLING-LIMITED | Address parser boundary and nonzero guard reviewed |
| 6 | TOOLING-LIMITED | Statement length guard |
| 7 | TOOLING-LIMITED | Verification-rule length guard |
| 8 | TOOLING-LIMITED | Future maturity guard |
| 9 | TOOLING-LIMITED | Deadline ordering guard |
| 10 | AUTOMATED | Simulator issue helper uses valid review window; bounds are source-checked |
| 11 | TOOLING-LIMITED | Anchor count guard |
| 12 | TOOLING-LIMITED | Maximum anchor count guard |
| 13 | AUTOMATED | Duplicate normalized URL simulator test/source assertion |
| 14 | TOOLING-LIMITED | HTTPS-only guard |
| 15 | TOOLING-LIMITED | Private/loopback host guard |
| 16 | TOOLING-LIMITED | Source-kind allowlist |
| 17 | AUTOMATED | Immutable Registry record and replay tests |
| 18 | AUTOMATED | Immutable evidence/replay tests |
| 19 | AUTOMATED | Remedy is stored in issuance/Registry record with no setter |
| 20 | AUTOMATED | Direct custody value and credit assertions |
| 21 | AUTOMATED | Simulator review-before-maturity boundary test |
| 22 | AUTOMATED | Simulator review-after-final-deadline boundary test |
| 23 | TOOLING-LIMITED | Terminal-state guard in Registry |
| 24 | TOOLING-LIMITED | Terminal-state guard in Registry |
| 25 | AUTOMATED | Simulator expiry path exercises deadline guard |
| 26 | AUTOMATED | Simulator terminal expiry and reconciliation |
| 27 | AUTOMATED | Simulator reviewers call the public review method |
| 28 | AUTOMATED | Simulator expiry is callable by a non-issuer |
| 29 | AUTOMATED | Registry deployer-only wiring and immutable remedy checks |
| 30 | AUTOMATED | Surface test confirms no cancel/override method |
| 31 | LIVE-PROVEN | Fresh fulfilled lifecycle `#0` finalized and settled; creation details recovered from canonical state |
| 32 | LIVE-PROVEN | Fresh breached lifecycle `#1` finalized and settled |
| 33 | LIVE-PROVEN | Fresh unavailable-source control `#2` finalized as inconclusive |
| 34 | TOOLING-LIMITED | Safe unresolved semantics reviewed; dedicated contradictory-source fixture pending |
| 35 | LIVE-PROVEN | Fresh unavailable/timing-ambiguous control `#2` finalized as inconclusive |
| 36 | TOOLING-LIMITED | Prompt requires reliable timing evidence |
| 37 | TOOLING-LIMITED | Failure-safe parser path reviewed |
| 38 | AUTOMATED | MAX_EVIDENCE_TEXT and oversized outcome source assertions |
| 39 | TOOLING-LIMITED | Prompt-injection defenses source-checked |
| 40 | TOOLING-LIMITED | Exact frozen-anchor browsing instruction source-checked |
| 41 | TOOLING-LIMITED | Snapshot digest and consensus-bound review history |
| 42 | TOOLING-LIMITED | Unknown model output does not default to a conclusive verdict |
| 43 | TOOLING-LIMITED | Verdict allowlist in Registry |
| 44 | TOOLING-LIMITED | Explanation is not used for state transition |
| 45 | AUTOMATED | Identical snapshot rejection simulator test plus bounded review-page tests |
| 46 | AUTOMATED | Per-reviewer cooldown simulator test |
| 47 | AUTOMATED | Changed-snapshot simulator test |
| 48 | LIVE-PROVEN | Fresh fulfilled proof settles exact bond credit to issuer |
| 49 | LIVE-PROVEN | Fresh breached proof settles exact bond credit to remedy |
| 50 | LIVE-PROVEN | Fresh inconclusive proof remains open with settlement locked |
| 51 | LIVE-PROVEN | Fresh final-pair candidate `#6` passed the real 15-minute deadline and completed expired reconciliation and withdrawal |
| 52 | AUTOMATED | Vault settled map and idempotence test |
| 53 | AUTOMATED | Duplicate settlement simulator test |
| 54 | AUTOMATED | Direct withdrawal-above-credit rejection |
| 55 | AUTOMATED | Direct Mode repeats the same withdrawal above the remaining credit and rejects it |
| 56 | AUTOMATED | Direct source-order assertion, direct-EOA origin gate and custody test |
| 57 | AUTOMATED | Vault storage is keyed by commitment and recipient; simulator isolation path |
| 58 | TOOLING-LIMITED | Accounting invariants documented; aggregate balance live proof pending |
| 59 | AUTOMATED | Settlement amount is the stored bond, not model output |
| 60 | AUTOMATED | Settlement recipient derives from immutable issuance terms |
| 61 | AUTOMATED | Frontend remembers hash immediately after submission |
| 62 | AUTOMATED | Explicit ACCEPTED stage and provisional activity state |
| 63 | AUTOMATED | Finalized helper rejects execution failures |
| 64 | AUTOMATED | UNDETERMINED is distinct from VOWMARK inconclusive |
| 65 | AUTOMATED | Frontend rereads canonical state after finality |
| 66 | LIVE-PROVEN | Fresh fulfilled and breached proofs cross the finalized settlement boundary |
| 67 | AUTOMATED | Direct non-Registry settlement rejection |
| 68 | AUTOMATED | Simulator duplicate finalized settlement rejection |
| 69 | LIVE-PROVEN | Fresh finalized settlement plus isolated withdrawal proof |
| 70 | TOOLING-LIMITED | Injected provider connect path |
| 71 | TOOLING-LIMITED | Rabby uses the same injected provider path |
| 72 | AUTOMATED | In-app Forget state and visible VOWMARK-only explanation |
| 73 | AUTOMATED | accountsChanged listener |
| 74 | AUTOMATED | Write actions check Studionet network |
| 75 | TOOLING-LIMITED | Switch/add Studionet guidance |
| 76 | TOOLING-LIMITED | Wallet errors surface in action state |
| 77 | AUTOMATED | Action failures are recorded as FAILED |
| 78 | AUTOMATED | Activity persists exact submitted hash |
| 79 | AUTOMATED | Activity reconciliation uses finalized reads |
| 80 | AUTOMATED | Dynamic commitment route has no localStorage dependency |
| 81 | AUTOMATED | Issuer route reads chain indexes |
| 82 | AUTOMATED | Activity labels are recovery-only and never canonical |
| 83 | TOOLING-LIMITED | Responsive CSS breakpoints |
| 84 | TOOLING-LIMITED | Labels/focus styles source review |
| 85 | TOOLING-LIMITED | Text labels accompany state colors |
| 86 | TOOLING-LIMITED | Product-language/originality audit |
| 87 | TOOLING-LIMITED | Route hierarchy audit |
| 88 | TOOLING-LIMITED | Visual identity audit |
| 89 | AUTOMATED | No backend directory/server route; frontend is direct RPC |
| 90 | TOOLING-LIMITED | No centralized AI endpoint in source audit |
| 91 | AUTOMATED | Injected wallet only; no server signer |
| 92 | LIVE-PROVEN | Final Vercel production deployment and public route checks recorded against the final application SHA |
| 93 | AUTOMATED | Contract-surface identifier test |
| 94 | LIVE-PROVEN | Final deployment, source commit and CI provenance recorded together |

## Status totals

The matrix contains 94 classified requirements. Final totals: `AUTOMATED 46`, `LIVE-PROVEN 12`, `TOOLING-LIMITED 36`, `PENDING 0`, `NOT-APPLICABLE 0`.
