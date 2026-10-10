# VOWMARK V4 security remediation

Status: the current V4 pair was deployed, accepted, and promoted to production
on 2026-10-10. The production frontend and the current live evidence use that
pair. The source-to-bytecode relationship is not independently source-attested
by the available Studionet tooling and is therefore reported conservatively.

## Final verdict

**PRODUCTION V4 IS LIVE AND THE CURRENT RELEASE EVIDENCE IS COMPLETE WITH
DISCLOSED PLATFORM LIMITATIONS.**

The production alias and current V4 pair were authorized separately and have
live lifecycle evidence. The current branch repairs out-of-order asynchronous
registration visibility; the source and simulator regression are verified, but
the available Studio RPC does not expose a source-verified bytecode artifact.
Issuer and remedy-wallet withdrawal transactions finalized successfully at the
application/parent boundary; an independently queryable child-delivery receipt
is not exposed by the pinned runtime.

## Scope and disposition

| Finding | V4 remediation | Disposition and residual limit |
| --- | --- | --- |
| Evidence URLs could be confused with trusted authority | Normalize HTTPS URLs identically in Registry and Vault. Reject credentials, malformed authorities, private/local IPs, every WHATWG numeric-final-label hostname including shortened hex/octal forms, and malformed labels. Canonicalize trailing dots and `:443`, preserve path/query/fragment, and require GitHub commit-shaped URLs for `VERSIONED_SOURCE`. | **Remediated in the current audited source and exercised by live validation.** GitHub revision shape proves only structural identity. Redirect targets, DNS resolution/rebinding, and renderer-specific behavior remain runtime-owned; source-to-bytecode equivalence is not independently attested by Studio. |
| Withdrawal routing and failure semantics were underspecified | Require `sender == origin`, debit credit before the external finalized transfer, expose the withdrawal policy, and describe the supported boundary as a direct top-level wallet caller. | **Boundary hardened; runtime limit established.** Official GenLayer documentation confirms finalized messages are asynchronous and a failed child value transfer is not automatically returned. The pinned contract/runtime exposes no safe failed-transfer callback or success receipt inside the withdrawal call, so no speculative retry/refund was added. |
| Prompt injection and hostile evidence text | Treat commitment/evidence as untrusted JSON records, prohibit browsing beyond frozen anchors, require time-bearing proof, and keep protocol instructions above the delimiter boundary. | **Remediated at the contract prompt boundary.** Consensus/model behavior still needs live validator calibration; simulator mocks do not prove model quality. |
| Review budget could be exhausted before the final window | Keep the normal 32-attempt hourly cap available throughout the review window, including the final five minutes. Only after normal capacity is exhausted may a separate four-attempt reserve be used during the final five minutes before the deadline. | **Remediated as a bounded liveness reserve.** This is not a claim that all Sybil resistance is solved; it guarantees only the configured reserve capacity under the contract’s reviewer cooldown and snapshot rules. If the final five minutes cross an epoch boundary, normal capacity resets for the new epoch while the commitment-scoped reserve remains bounded across the final window. |
| Source authority was conflated with a source-kind label | Store derived authority, revision, and authority-status metadata. `VERSIONED_SOURCE` is limited to commit-addressed GitHub URLs; publication, on-chain, and third-party records are labeled unverified. | **Remediated as explicit classification.** Provider ownership, signatures, and historical content authenticity are outside the current runtime interface. |
| Model output parser accepted ambiguous output | Bound raw response length, accept at most one JSON fence, reject additional text/fences, reject duplicate keys, require exactly `{\"verdict\": ...}`, and accept only the three closed verdict values. Parse failure occurs before any review state write. | **Remediated and mutation-tested.** The parser does not infer an economic recipient or amount from model output. |
| Security evidence lacked adversarial release gates | Expanded simulator/direct tests and the executable mutation inventory; added frontend type/build checks and a V4 release checklist. | **Remediated for local gates and current live acceptance.** Historical transaction reports remain separate from the current pair. |

## Release identity

| Track | Status | Timing policy | Addresses |
| --- | --- | --- | --- |
| Historical V1 | Superseded; frozen evidence retained | 15-minute minimum review window | The Registry/Vault in [`HANDOFF_STATUS.md`](../HANDOFF_STATUS.md) |
| Historical V4 canary | Studionet deployed and Preview-wired; predates final fix | 20-minute minimum review window plus bounded final-window reserve | [`0xE425f8c6…4Be26`](https://explorer-studio.genlayer.com/address/0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26) / [`0x36D41a7B…462C`](https://explorer-studio.genlayer.com/address/0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C) |
| Previous V4 production pair | Superseded; historical evidence retained | 20-minute policy plus bounded final-window reserve | [`0x3cA983F7…e4eF7`](https://explorer-studio.genlayer.com/address/0x3cA983F7CC78d10d3970a6Da719b12e17E4e4eF7) / [`0xE9e153dc…ED4Ce`](https://explorer-studio.genlayer.com/address/0xE9e153dc4E33762B2bA468EaC74bEABfe9cED4Ce) |
| Production V4 | Authorized, deployed, lifecycle-tested, and promoted | 20-minute policy plus bounded final-window reserve | [`0xA3319fE2…B8707`](https://explorer-studio.genlayer.com/address/0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707) / [`0x7cd9B382…14bd7`](https://explorer-studio.genlayer.com/address/0x7cd9B38266eC92024c938354c498245D34314bd7) |
| Current certification source | Branch `v4-final-certification`, commit `67afe8e`; live frontend matches exact commit | Same 20-minute policy | [`GitHub source`](https://github.com/Bibidee/vowmark/tree/67afe8ef5b029bf54ef6f9cf18f811881532c240); contract bytecode source-attestation unavailable |

The production frontend is configured with the current Production V4 pair.
Historical V1, canary and previous-production addresses remain isolated in
frozen evidence only.

The current production deployment is `dpl_FUeNAXRgLLzKoUCUtb4QSNCXR9Ez`,
built from commit `67afe8ef5b029bf54ef6f9cf18f811881532c240`. The production
bundle contains the current pair and Studio explorer configuration; historical
Preview aliases remain historical snapshots only. No separate on-chain
source-bytecode attestation was established.

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

The current [final submission evidence](../evidence/live_v4_final_submission_2026-10-10.md)
records actual current-pair lifecycle state, custody reconciliation, browser
validation and the finalized remedy-wallet transaction. The historical
[withdrawal delivery audit](../evidence/live_v4_withdrawal_delivery_2026-10-09.md)
remains useful for the runtime boundary but does not describe the current pair.

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
| Simulator suite | **90 passed** on corrected local source; earlier exact-head Linux `5e6a917` had **69 passed**; still earlier local report had **68 passed** |
| Direct Mode suite | **9 passed** |
| Mutation inventory | **49 generated / 49 valid / 49 killed / 0 survived / 0 invalid / 0 tooling-limited** |
| Frontend typecheck | **PASS** |
| Frontend lint | **PASS** |
| Frontend board invariant test | **PASS** |
| Frontend timezone test | **PASS** (UTC and UTC+1) |
| Frontend Playwright browser suite | **44 passed** |
| Frontend production build | **PASS** |
| Frozen V2 repository release guard | **NOT APPLICABLE on V4**; it correctly rejects changed runtime paths relative to V2's frozen SHA |
| V4 release-consistency guard | **PASS** |
| Contract `genvm-lint lint` | **PASS; 3 AST checks per contract**. Full `check` is tooling-limited: local pinned SDK artifact is absent from the linter cache. Direct Mode and simulator compilation passed. |

`npm audit --omit=dev --audit-level=high` was rerun against the production
dependency graph on 2026-10-09 and reported **0 vulnerabilities**. This does
not audit the chain runtime or unlisted dependencies.

The full (including development dependencies) audit reported **5 high
findings** along one chain:
`eslint-config-next@16.4.0` → `@next/eslint-plugin-next@16.4.0` →
`fast-glob@3.3.1` → `micromatch@4.0.8` → `braces@3.0.3`.
The root [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
lists **no patched version**. `npm audit` offered an `eslint-config-next`
14.2.35 major downgrade, incompatible with this Next 16 release, so it was
not applied. This affects repo-controlled lint tooling, not the production
dependency graph; it remains an explicit development-tool risk, not a claim
that the full dependency tree is clean.

## Controlled live canary

The current V4 pair was deployed and reread on Studionet 61999, then wired to
the production frontend after live acceptance. Current commitments produced
`FULFILLED` (`#1`), `BREACHED` (`#2`), an `INCONCLUSIVE` review followed by
`EXPIRED_UNRESOLVED` (`#0`), and finalized issuer/remedy-wallet withdrawals.
The current transaction matrix, accounting table and browser validation are in
[`../evidence/live_v4_final_submission_2026-10-10.md`](../evidence/live_v4_final_submission_2026-10-10.md).
The earlier canary and validator receipt reports remain historical and are not
used as current-pair evidence.

## Deliberately unexecuted or unclaimable actions

- No historical V1 or V4 transaction report was rewritten.
- No independent child-transaction delivery receipt was claimed because the
  pinned Studio runtime does not expose one reliably.

The historical V4 canary is preserved in
[`../evidence/live_v4_smoke_2026-10-09.md`](../evidence/live_v4_smoke_2026-10-09.md);
the current production certification is preserved in
[`../evidence/live_v4_final_submission_2026-10-10.md`](../evidence/live_v4_final_submission_2026-10-10.md).

## Release disposition

The current release is submission-ready with the platform/tooling limitations
listed in the final evidence. Any future Registry or Vault source change must
receive fresh authorization, a fresh deployment, Preview acceptance and
production-promotion authorization; the current pair must not be silently
relabeled as a different source version.
