# VOWMARK V4 security remediation

Status: the corrected V4 pair was deployed, accepted, and promoted to
production on 2026-10-09. A later sparse-registration ordering fix now changes
Registry source and therefore requires a fresh pair and fresh authorization.

## Final verdict

**PRODUCTION V4 IS LIVE. CURRENT SOURCE CHANGES ARE NOT YET DEPLOYED.**

The production alias and final V4 pair were authorized separately and have
live lifecycle evidence. The current branch additionally repairs out-of-order
asynchronous registration visibility. Because that repair changes Registry
bytecode, it cannot be represented by the existing production addresses. A
fresh deployment, Preview acceptance, and promotion require fresh
authorization. Issuer withdrawal parents and external-message emission are
verified; external delivery remains independently unverified.

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
| Historical V1 | Superseded; frozen evidence retained | 15-minute minimum review window | The Registry/Vault in [`HANDOFF_STATUS.md`](../HANDOFF_STATUS.md) |
| Historical V4 canary | Studionet deployed and Preview-wired; predates final fix | 20-minute minimum review window plus bounded final-window reserve | [`0xE425f8c6…4Be26`](https://explorer-studio.genlayer.com/address/0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26) / [`0x36D41a7B…462C`](https://explorer-studio.genlayer.com/address/0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C) |
| Production V4 | Authorized, deployed, lifecycle-tested, and promoted | 20-minute policy plus bounded final-window reserve | [`0x3cA983F7…e4eF7`](https://explorer-studio.genlayer.com/address/0x3cA983F7CC78d10d3970a6Da719b12e17E4e4eF7) / [`0xE9e153dc…ED4Ce`](https://explorer-studio.genlayer.com/address/0xE9e153dc4E33762B2bA468EaC74bEABfe9cED4Ce) |
| Current sparse-registration source | Local candidate; fresh authorization required | Same 20-minute policy | New addresses required |

The production frontend is configured with the Production V4 pair. Historical
V1 and canary addresses remain isolated in frozen evidence only.

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

## Deliberately unexecuted actions in this certification branch

- No replacement Registry/Vault was deployed for the sparse-registration fix.
- No production environment or alias was changed after that source edit.
- No historical V1 or V4 evidence was rewritten.

The V4 deployment and live canary are recorded in
[`../evidence/live_v4_smoke_2026-10-09.md`](../evidence/live_v4_smoke_2026-10-09.md).

## Fresh deployment and later promotion plan

1. Authorize a fresh corrected V4 Registry/Vault deployment separately.
2. Finalize and read back the new pair, wire a separate Preview, and run a new
   live acceptance including changed URL rejection and economic lifecycle.
3. Review that new evidence and authorize production promotion separately.
4. Keep `https://the-vowmark.vercel.app/` on the authorized Production V4 pair until then.

Rollback is operationally simple before promotion: leave V1 contracts and frontend untouched. After a V4 promotion, rollback means restoring the previously authorized frontend configuration; V4 contract state is append-only and is not erased or silently substituted.
