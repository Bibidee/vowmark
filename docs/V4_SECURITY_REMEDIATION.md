# VOWMARK V4 security remediation

Status: implementation complete on `v4-security-remediation`; **not deployed** and **not promoted**.

## Final verdict

**V4 READY FOR CONTROLLED DEPLOYMENT AUTHORIZATION**

This verdict covers the reviewed code and local gates. It does not authorize
wallet signing, contract deployment, frontend promotion, or a claim that live
V4 economic/model behavior has already been proven. Production promotion
still requires a separately authorized Studionet canary and evidence review.

The V1 production release remains the submitted Studionet release. Its
Registry, Vault, frontend alias and historical evidence were not changed by
this branch. The V4 candidate frontend is explicitly addressless until fresh
V4 contracts are deployed; it must not reuse V1 addresses. V4 introduces a
new commitment field and new evidence metadata, so it requires a fresh
Registry/Vault deployment and a separately reviewed frontend configuration
before it can be authorized for deployment.

## Scope and disposition

| Finding | V4 remediation | Disposition and residual limit |
| --- | --- | --- |
| Evidence URLs could be confused with trusted authority | Normalize HTTPS URLs identically in Registry and Vault, reject credentials/control characters/private or local hosts, reject dotted hexadecimal IPv4 spellings and malformed host labels, canonicalize trailing dots and explicit `:443`, preserve query/fragment identity, and require immutable GitHub commit-shaped URLs for `VERSIONED_SOURCE`. | **Remediated for the enforced input policy.** A structurally valid GitHub commit URL is not a cryptographic proof that the content is authentic; all other source classes are explicitly marked unverified. Redirect targets, DNS resolution/rebinding and renderer-specific behavior remain runtime-owned. |
| Withdrawal routing and failure semantics were underspecified | Require `sender == origin`, debit credit before the external finalized transfer, expose the withdrawal policy, and describe the supported boundary as a direct top-level wallet caller. | **Boundary hardened; runtime limit established.** Official GenLayer documentation confirms finalized messages are asynchronous and a failed child value transfer is not automatically returned. The pinned contract/runtime exposes no safe failed-transfer callback or success receipt inside the withdrawal call, so no speculative retry/refund was added. |
| Prompt injection and hostile evidence text | Treat commitment/evidence as untrusted JSON records, prohibit browsing beyond frozen anchors, require time-bearing proof, and keep protocol instructions above the delimiter boundary. | **Remediated at the contract prompt boundary.** Consensus/model behavior still needs live validator calibration; simulator mocks do not prove model quality. |
| Review budget could be exhausted before the final window | Keep the normal 32-attempt hourly cap available throughout the review window, including the final five minutes. Only after normal capacity is exhausted may a separate four-attempt reserve be used during the final five minutes before the deadline. | **Remediated as a bounded liveness reserve.** This is not a claim that all Sybil resistance is solved; it guarantees only the configured reserve capacity under the contract’s reviewer cooldown and snapshot rules. If the final five minutes cross an epoch boundary, normal capacity resets for the new epoch while the commitment-scoped reserve remains bounded across the final window. |
| Source authority was conflated with a source-kind label | Store derived authority, revision, and authority-status metadata. `VERSIONED_SOURCE` is limited to commit-addressed GitHub URLs; publication, on-chain, and third-party records are labeled unverified. | **Remediated as explicit classification.** Provider ownership, signatures, and historical content authenticity are outside the current runtime interface. |
| Model output parser accepted ambiguous output | Bound raw response length, accept at most one JSON fence, reject additional text/fences, reject duplicate keys, require exactly `{\"verdict\": ...}`, and accept only the three closed verdict values. Parse failure occurs before any review state write. | **Remediated and mutation-tested.** The parser does not infer an economic recipient or amount from model output. |
| Security evidence lacked adversarial release gates | Expanded simulator/direct tests and the executable mutation inventory; added frontend type/build checks and a V4 release checklist. | **Remediated for the executable local gates.** Live V4 deployment, live V4 lifecycle proofs, and model calibration remain intentionally unexecuted because deployment authorization was not provided. |

## Release identity

| Track | Status | Timing policy | Addresses |
| --- | --- | --- | --- |
| Production V1 | Authorized and unchanged | 15-minute minimum review window | The Registry/Vault in [`HANDOFF_STATUS.md`](../HANDOFF_STATUS.md) |
| Candidate V4 | Local code only; not deployed or promoted | 20-minute minimum review window plus bounded final-window reserve | Unassigned until a fresh authorized deployment |

The V4 frontend configuration intentionally leaves contract addresses empty
until deployment. This prevents a V4 preview from silently reading or writing
the V1 production contracts.

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

## Independent hostile re-audit disposition

- **Critical:** none reproduced.
- **High:** none reproduced.
- **Medium:** the dotted-hexadecimal host bypass was reproduced and fixed in
  both contract parsers; the failed-transfer recovery limitation is a runtime
  design boundary, not an untested claim of recovery.
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
| Full Python suite (`tests`) | **87 passed** |
| Simulator suite | **68 passed** |
| Direct Mode suite | **9 passed** |
| Mutation inventory | **45 generated / 45 valid / 45 killed / 0 survived / 0 invalid / 0 tooling-limited** |
| Frontend typecheck | **PASS** |
| Frontend lint | **PASS** |
| Frontend board invariant test | **PASS** |
| Frontend Playwright browser suite | **38 passed** |
| Frontend production build | **PASS** |
| Repository release guard | **PASS** |
| V4 release-consistency guard | **PASS** |
| Contract `genvm-lint` | **PASS; no lint warnings or errors** |

The package audit recheck was attempted with `npm audit --omit=dev`, but the managed sandbox could not resolve `registry.npmjs.org`. No security conclusion is drawn from that failed network request; the existing dependency audit artifact remains the historical record for the previously completed audit.

## Deliberately unexecuted actions

- No V4 Registry or Vault was deployed.
- No V4 wiring transaction was sent.
- No production frontend alias or Vercel deployment was changed.
- No V4 live fulfilled, breached, inconclusive, expired, or withdrawal proof is claimed.
- No existing V1 deployment address or production evidence was rewritten.

## Deployment plan when separately authorized

1. Compile and schema-check the V4 Registry/Vault pair against the pinned GenLayer toolchain.
2. Deploy fresh V4 Registry and Vault contracts on Studionet 61999; do not reuse V1 addresses because the storage/API shape changed.
3. Wire Registry to Vault using the deployer-only initialization path and reread both configurations from finalized state.
4. Run a short-lived live canary covering issue, finalized review, inconclusive retry, breached/fulfilled settlement, expiry, and withdrawal.
5. Record exact transaction and explorer links, contract addresses, source commit, and frontend configuration in a new evidence artifact.
6. Promote a V4 frontend only after the canary and evidence review; keep `https://the-vowmark.vercel.app/` pointed at the currently authorized V1 release until that decision.

Rollback is operationally simple before promotion: leave V1 contracts and frontend untouched. After a V4 promotion, rollback means restoring the previously authorized frontend configuration; V4 contract state is append-only and is not erased or silently substituted.
