# VOWMARK V4 security remediation

Status: final numeric-host remediation implemented on `v4-security-remediation`;
the earlier Studionet canary predates this correction; **not promoted**.

## Final verdict

**READY FOR FINAL DEPLOYMENT AUTHORIZATION**, subject to exact-head CI.
**Not ready for production promotion.**

This verdict separates corrected source from historical canary evidence. The
original V4 Preview is wired to the pre-fix pair; its lifecycle receipts do
not prove changed bytecode. No new deployment or production promotion has
been authorized. Issuer withdrawal parents and external-message emission are
verified; external delivery is not independently verified.

The V1 production release remains the submitted Studionet release. Its
Registry, Vault, frontend alias and historical evidence were not changed by
this branch. V4 introduces a new commitment field and new evidence metadata,
so it uses the fresh Registry/Vault pair and a separate Preview configuration.

## Scope and disposition

| Finding | V4 remediation | Disposition and residual limit |
| --- | --- | --- |
| Evidence URLs could be confused with trusted authority | Normalize HTTPS URLs identically in Registry and Vault. Reject credentials, malformed authorities, private/local IPs, every WHATWG numeric-final-label hostname including shortened hex/octal forms, and malformed labels. Canonicalize trailing dots and `:443`, preserve path/query/fragment, and require GitHub commit-shaped URLs for `VERSIONED_SOURCE`. | **Remediated in corrected source, not deployed.** GitHub revision shape proves only structural identity. Redirect targets, DNS resolution/rebinding, and renderer-specific behavior remain runtime-owned. |
| Withdrawal routing and failure semantics were underspecified | Require `sender == origin`, debit credit before the external finalized transfer, expose the withdrawal policy, and describe the supported boundary as a direct top-level wallet caller. | **Boundary hardened; runtime limit established.** Official GenLayer documentation confirms finalized messages are asynchronous and a failed child value transfer is not automatically returned. The pinned contract/runtime exposes no safe failed-transfer callback or success receipt inside the withdrawal call, so no speculative retry/refund was added. |
| Prompt injection and hostile evidence text | Treat commitment/evidence as untrusted JSON records, prohibit browsing beyond frozen anchors, require time-bearing proof, and keep protocol instructions above the delimiter boundary. | **Remediated at the contract prompt boundary.** Consensus/model behavior still needs live validator calibration; simulator mocks do not prove model quality. |
| Review budget could be exhausted before the final window | Keep the normal 32-attempt hourly cap available throughout the review window, including the final five minutes. Only after normal capacity is exhausted may a separate four-attempt reserve be used during the final five minutes before the deadline. | **Remediated as a bounded liveness reserve.** This is not a claim that all Sybil resistance is solved; it guarantees only the configured reserve capacity under the contract’s reviewer cooldown and snapshot rules. If the final five minutes cross an epoch boundary, normal capacity resets for the new epoch while the commitment-scoped reserve remains bounded across the final window. |
| Source authority was conflated with a source-kind label | Store derived authority, revision, and authority-status metadata. `VERSIONED_SOURCE` is limited to commit-addressed GitHub URLs; publication, on-chain, and third-party records are labeled unverified. | **Remediated as explicit classification.** Provider ownership, signatures, and historical content authenticity are outside the current runtime interface. |
| Model output parser accepted ambiguous output | Bound raw response length, accept at most one JSON fence, reject additional text/fences, reject duplicate keys, require exactly `{\"verdict\": ...}`, and accept only the three closed verdict values. Parse failure occurs before any review state write. | **Remediated and mutation-tested.** The parser does not infer an economic recipient or amount from model output. |
| Security evidence lacked adversarial release gates | Expanded simulator/direct tests and the executable mutation inventory; added frontend type/build checks and a V4 release checklist. | **Remediated for local gates.** Historical canary lifecycle and parent-withdrawal receipts are separate. Fresh live acceptance is required for corrected bytecode. |

## Release identity

| Track | Status | Timing policy | Addresses |
| --- | --- | --- | --- |
| Production V1 | Authorized and unchanged | 15-minute minimum review window | The Registry/Vault in [`HANDOFF_STATUS.md`](../HANDOFF_STATUS.md) |
| Historical V4 canary | Studionet deployed and Preview-wired; predates final fix | 20-minute minimum review window plus bounded final-window reserve | [`0xE425f8c6…4Be26`](https://explorer-studio.genlayer.com/address/0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26) / [`0x36D41a7B…462C`](https://explorer-studio.genlayer.com/address/0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C) |
| Corrected V4 source | Not deployed; awaits explicit authorization | Same 20-minute policy | New addresses required |

The V4 frontend configuration uses Preview-only environment values for the
fresh pair. Production V1 remains isolated and continues to use its historical
configuration.

The V4 branch Preview alias is
[`vowmark-git-v4-security-remediation-bibidees-projects.vercel.app`](https://vowmark-git-v4-security-remediation-bibidees-projects.vercel.app/).
The verified corrected-source snapshot on commit `869b70e` was
[`vowmark-9t7jotj8w-bibidees-projects.vercel.app`](https://vowmark-9t7jotj8w-bibidees-projects.vercel.app/)
(`dpl_7oj5inoBkucQVo35KAyQtSRTEdKf`). Four checked
routes returned 200 and its bundle contained the canary addresses. Historical
repository contract source matches `9d4082c` through `5e6a917`; no separate
on-chain source-bytecode attestation was established. The fix is not deployed.

## Runtime findings used for the withdrawal disposition

The official GenLayer [Messages documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/messages)
states that internal finalized messages are asynchronous child transactions,
and the child context preserves the original `origin_address`. The official
[Value Transfers documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers)
states that external transfers are finalized-only and that a failed child
value transfer is not automatically returned to the sender. The official
[Transaction Context documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/transaction-context)
does not expose an EOA-vs-contract predicate. These facts establish why the
contract keeps debit-before-send and exposes a direct-wallet boundary without
inventing an unsafe recovery operation.

The [withdrawal delivery audit](../evidence/live_v4_withdrawal_delivery_2026-10-09.md)
records actual parent receipts, emitted destinations and amounts, unsupported
child-delivery observation, and remedy-wallet status
`PENDING AUTHORIZED REMEDY-WALLET SIGNATURE`.

## Independent hostile re-audit disposition

- **Critical:** none reproduced.
- **High:** none reproduced.
- **Medium:** shortened numeric/hex hostname aliases bypassed the old
  four-label check. Both parser boundaries now reject the WHATWG
  numeric-final-label class, but the original canary remains pre-fix.
  Failed-transfer recovery remains a runtime limitation.
- **Low / informational:** DNS rebinding, public-to-private redirects and
  renderer-specific fetch policy remain unverified because the contract cannot
  resolve or pin network destinations and no unsafe probes were performed.
- Source authority remains conservative: only the shape of a GitHub revision is
  structurally verified. Provider identity, commit existence, publication
  timestamps, chain finality and third-party authority remain unverified.

## Test evidence

Executed from the managed Windows workspace with the repository’s `.venv-direct` runtime and explicit in-repository pytest basetemp directories:

| Gate | Result |
| --- | --- |
| Full Python suite (`tests`) | **107 passed** on corrected local source |
| Simulator suite | **89 passed** on corrected local source; earlier exact-head Linux `5e6a917` had **69 passed**; still earlier local report had **68 passed** |
| Direct Mode suite | **9 passed** |
| Mutation inventory | **49 generated / 49 valid / 49 killed / 0 survived / 0 invalid / 0 tooling-limited** |
| Frontend typecheck | **PASS** |
| Frontend lint | **PASS** |
| Frontend board invariant test | **PASS** |
| Frontend timezone test | **PASS** (UTC and UTC+1) |
| Frontend Playwright browser suite | **38 passed** |
| Frontend production build | **PASS** |
| Frozen V2 repository release guard | **NOT APPLICABLE on V4**; it correctly rejects changed runtime paths relative to V2's frozen SHA |
| V4 release-consistency guard | **PASS** |
| Contract `genvm-lint lint` | **PASS; 3 AST checks per contract**. Full `check` is tooling-limited: local pinned SDK artifact is absent from the linter cache. Direct Mode and simulator compilation passed. |

`npm audit --omit=dev --audit-level=high` was rerun against the production
dependency graph on 2026-10-09 and reported **0 vulnerabilities**. This does
not audit the chain runtime or unlisted dependencies.

## Controlled live canary

The fresh V4 pair was deployed and reread on Studionet 61999. The separate
Preview was wired to those addresses without changing V1 production. Live
commitments produced `FULFILLED` (`#1`), `BREACHED` (`#2`),
`INCONCLUSIVE`/open (`#3`), and `EXPIRED_UNRESOLVED` after the real 20-minute
deadline (`#4`). Finalized withdrawal **parent calls**, emitted external
messages and credit readbacks were observed for the fulfilled and expired
paths; external delivery was not independently verified. The transaction matrix is in
[`../evidence/live_v4_smoke_2026-10-09.md`](../evidence/live_v4_smoke_2026-10-09.md);
the receipt-level validator/model audit is in
[`../evidence/live_v4_validator_model_2026-10-09.md`](../evidence/live_v4_validator_model_2026-10-09.md).

## Deliberately unexecuted actions

- No production frontend alias was changed or promoted to V4.
- No existing V1 deployment address or production evidence was rewritten.
- No new corrected V4 deployment, remedy-wallet signature or withdrawal was
  performed; the historical V4 canary is not a substitute.

The V4 deployment and live canary are recorded in
[`../evidence/live_v4_smoke_2026-10-09.md`](../evidence/live_v4_smoke_2026-10-09.md).

## Fresh deployment and later promotion plan

1. Authorize a fresh corrected V4 Registry/Vault deployment separately.
2. Finalize and read back the new pair, wire a separate Preview, and run a new
   live acceptance including changed URL rejection and economic lifecycle.
3. Review that new evidence and authorize production promotion separately.
4. Keep `https://the-vowmark.vercel.app/` on authorized V1 until then.

Rollback is operationally simple before promotion: leave V1 contracts and frontend untouched. After a V4 promotion, rollback means restoring the previously authorized frontend configuration; V4 contract state is append-only and is not erased or silently substituted.
