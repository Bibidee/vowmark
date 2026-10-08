# VOWMARK V1 test coverage matrix

This maps every item in [`TEST_PLAN.md`](TEST_PLAN.md) to the strongest evidence currently available. `AUTOMATED` means a repository test covers the invariant. `LIVE FRESH` is reserved for a finalized Studionet proof against the current canonical addresses. `PENDING` is intentionally not a pass.

| # | Status | Evidence |
| ---: | --- | --- |
| 1 | AUTOMATED | Direct/contract surface creation coverage |
| 2 | REVIEWED | Contract bounds permit up to five anchors; not separately executed |
| 3 | REVIEWED | Zero-bond guard in Vault source and surface assertions |
| 4 | REVIEWED | Address validation and issuer/remedy inequality in Vault |
| 5 | REVIEWED | Address parser boundary and nonzero guard reviewed |
| 6 | REVIEWED | Statement length guard |
| 7 | REVIEWED | Verification-rule length guard |
| 8 | REVIEWED | Future maturity guard |
| 9 | REVIEWED | Deadline ordering guard |
| 10 | AUTOMATED | Simulator issue helper uses valid review window; bounds are source-checked |
| 11 | REVIEWED | Anchor count guard |
| 12 | REVIEWED | Maximum anchor count guard |
| 13 | AUTOMATED | Duplicate normalized URL simulator test/source assertion |
| 14 | REVIEWED | HTTPS-only guard |
| 15 | REVIEWED | Private/loopback host guard |
| 16 | REVIEWED | Source-kind allowlist |
| 17 | AUTOMATED | Immutable Registry record and replay tests |
| 18 | AUTOMATED | Immutable evidence/replay tests |
| 19 | AUTOMATED | Remedy is stored in issuance/Registry record with no setter |
| 20 | AUTOMATED | Direct custody value and credit assertions |
| 21 | REVIEWED | Lifecycle guard in Registry; dedicated negative test pending |
| 22 | REVIEWED | Lifecycle guard in Registry; dedicated negative test pending |
| 23 | REVIEWED | Terminal-state guard in Registry |
| 24 | REVIEWED | Terminal-state guard in Registry |
| 25 | AUTOMATED | Simulator expiry path exercises deadline guard |
| 26 | AUTOMATED | Simulator terminal expiry and reconciliation |
| 27 | AUTOMATED | Simulator reviewers call the public review method |
| 28 | AUTOMATED | Simulator expiry is callable by a non-issuer |
| 29 | AUTOMATED | Registry deployer-only wiring and immutable remedy checks |
| 30 | AUTOMATED | Surface test confirms no cancel/override method |
| 31 | LIVE FRESH | Fresh fulfilled lifecycle `#6` finalized and settled |
| 32 | LIVE FRESH | Fresh breached lifecycle `#4` finalized and settled |
| 33 | LIVE FRESH | Fresh unavailable-source control `#5` finalized as inconclusive |
| 34 | REVIEWED | Safe unresolved semantics reviewed; dedicated contradictory-source fixture pending |
| 35 | LIVE FRESH | Fresh unavailable/timing-ambiguous control `#5` finalized as inconclusive |
| 36 | REVIEWED | Prompt requires reliable timing evidence |
| 37 | REVIEWED | Failure-safe parser path reviewed |
| 38 | AUTOMATED | MAX_EVIDENCE_TEXT and oversized outcome source assertions |
| 39 | REVIEWED | Prompt-injection defenses source-checked |
| 40 | REVIEWED | Exact frozen-anchor browsing instruction source-checked |
| 41 | REVIEWED | Snapshot digest and consensus-bound review history |
| 42 | REVIEWED | Unknown model output does not default to a conclusive verdict |
| 43 | REVIEWED | Verdict allowlist in Registry |
| 44 | REVIEWED | Explanation is not used for state transition |
| 45 | AUTOMATED | Identical snapshot rejection simulator test |
| 46 | AUTOMATED | Per-reviewer cooldown simulator test |
| 47 | AUTOMATED | Changed-snapshot simulator test |
| 48 | LIVE FRESH | Fresh fulfilled proof settles exact bond credit to issuer |
| 49 | LIVE FRESH | Fresh breached proof settles exact bond credit to remedy |
| 50 | LIVE FRESH | Fresh inconclusive proof remains open with settlement locked |
| 51 | AUTOMATED | Simulator expiry credits issuer; real deadline proof pending |
| 52 | AUTOMATED | Vault settled map and idempotence test |
| 53 | AUTOMATED | Duplicate settlement simulator test |
| 54 | AUTOMATED | Direct withdrawal-above-credit rejection |
| 55 | AUTOMATED | Direct Mode repeats the same withdrawal above the remaining credit and rejects it |
| 56 | AUTOMATED | Direct source-order assertion and custody test |
| 57 | AUTOMATED | Vault storage is keyed by commitment and recipient; simulator isolation path |
| 58 | REVIEWED | Accounting invariants documented; aggregate balance live proof pending |
| 59 | AUTOMATED | Settlement amount is the stored bond, not model output |
| 60 | AUTOMATED | Settlement recipient derives from immutable issuance terms |
| 61 | AUTOMATED | Frontend remembers hash immediately after submission |
| 62 | AUTOMATED | Explicit ACCEPTED stage and provisional activity state |
| 63 | AUTOMATED | Finalized helper rejects execution failures |
| 64 | AUTOMATED | UNDETERMINED is distinct from VOWMARK inconclusive |
| 65 | AUTOMATED | Frontend rereads canonical state after finality |
| 66 | LIVE FRESH | Fresh fulfilled and breached proofs cross the finalized settlement boundary |
| 67 | AUTOMATED | Direct non-Registry settlement rejection |
| 68 | AUTOMATED | Simulator duplicate finalized settlement rejection |
| 69 | LIVE FRESH | Fresh finalized settlement plus isolated withdrawal proof |
| 70 | REVIEWED | Injected provider connect path |
| 71 | REVIEWED | Rabby uses the same injected provider path |
| 72 | AUTOMATED | In-app Forget state and visible VOWMARK-only explanation |
| 73 | AUTOMATED | accountsChanged listener |
| 74 | AUTOMATED | Write actions check Studionet network |
| 75 | REVIEWED | Switch/add Studionet guidance |
| 76 | REVIEWED | Wallet errors surface in action state |
| 77 | AUTOMATED | Action failures are recorded as FAILED |
| 78 | AUTOMATED | Activity persists exact submitted hash |
| 79 | AUTOMATED | Activity reconciliation uses finalized reads |
| 80 | AUTOMATED | Dynamic commitment route has no localStorage dependency |
| 81 | AUTOMATED | Issuer route reads chain indexes |
| 82 | AUTOMATED | Activity labels are recovery-only and never canonical |
| 83 | REVIEWED | Responsive CSS breakpoints |
| 84 | REVIEWED | Labels/focus styles source review |
| 85 | REVIEWED | Text labels accompany state colors |
| 86 | REVIEWED | Product-language/originality audit |
| 87 | REVIEWED | Route hierarchy audit |
| 88 | REVIEWED | Visual identity audit |
| 89 | AUTOMATED | No backend directory/server route; frontend is direct RPC |
| 90 | REVIEWED | No centralized AI endpoint in source audit |
| 91 | AUTOMATED | Injected wallet only; no server signer |
| 92 | PENDING | Fresh production deployment audit after commit |
| 93 | AUTOMATED | Contract-surface identifier test |
| 94 | PENDING | Fresh deployment/production evidence must be committed after CI and Vercel redeploy |
