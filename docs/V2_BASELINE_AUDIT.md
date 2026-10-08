# VOWMARK V2 Baseline Audit

This audit was performed from the frozen submitted V1 commit before V2 edits.

- Repository: `https://github.com/Bibidee/vowmark`
- Frozen V1 HEAD: `97b5ca8888eeaca3d2b1deb733c832c8448d4383`
- V1 application SHA: `8dbb131958d28f87d9f618a9d2bbd09744a6986b`
- Branch used for V2: `v2-hardening`
- V1 production: `https://the-vowmark.vercel.app/` (not modified)
- Studionet chain: `61999`
- V1 Registry: `0x3Be513bB6CAe652826A6092C0715AF39E7189c71`
- V1 Vault: `0xf8D89f89aD160546780eD76Cd64C550d91bAf501`

## Current strengths

- The product identity is coherent: public promise, locked GEN, frozen evidence, GenLayer judgment, economic settlement, and permanent public record.
- Registry and Vault use bounded storage and bounded reads. Review history exposes an explicit count and newest-first pages capped at 25 records.
- Creation validates nonzero bond and addresses, distinct issuer/remedy, future maturity, a 15-minute minimum review window, a 90-day maximum, 1–5 HTTPS anchors, bounded text, source kinds, purposes, and duplicate normalized URLs.
- Wiring is deployer-only and immutable after initialization or the first commitment. Registry registration and settlement are caller-gated to the immutable Vault/Registry addresses.
- Review semantics are explicit: `now >= maturity` and `now < final_review_deadline`; expiry is `now >= final_review_deadline` while the outcome is open.
- Review liveness has per-reviewer cooldown, an hourly capacity epoch, a 32-attempt epoch cap, changed-snapshot protection, and no permanent lifetime cap.
- Judgment uses `gl.nondet.web.render` only on frozen anchors and `gl.nondet.exec_prompt` with a conservative prompt. Unavailable, oversized, malformed, contradictory, stale, or temporally insufficient evidence is instructed toward `INCONCLUSIVE`.
- Settlement derives recipient and amount from immutable issuance terms. The Vault credits exactly once, requires registration, debits before external finalized withdrawal, and requires a direct EOA caller (`sender_address == origin_address`).
- The frontend distinguishes submitted, accepted, finalized, failed, and undetermined transaction states; canonical reads use finalized state and local activity is recovery-only.
- V1 has live fulfilled, breached, inconclusive, expired, settlement, withdrawal, wiring-negative, and pagination evidence against its submitted pair.

## Current risks

- There is no mutation harness, so the existing green suite does not demonstrate that weakening each important invariant causes a behavioral failure.
- Creation and economics are not comprehensively adversarial. V1 lacks dedicated behavioral coverage for many zero/oversized/malformed combinations, multiple simultaneous commitments, partial and repeated withdrawals, and conservation across all settlement branches.
- Direct Mode and simulator tests are valuable but do not cover a real browser session, wallet rejection, provider absence, wrong-network switching, reload recovery, keyboard behavior, or responsive layout at controlled viewport sizes.
- No frozen judgment calibration corpus quantifies false conclusive outcomes under unavailable, stale, contradictory, prompt-injected, or temporally ambiguous evidence.
- `strict_eq` compares the complete judgment object, including snapshot and source-set digests. This is safe for provenance but may be brittle when validators reach the same economic verdict over materially equivalent but byte-different fetches.
- The protocol explicitly does not prevent a coordinated Sybil set from temporarily filling the 32-attempt epoch capacity. It prevents permanent lifetime exhaustion and isolates honest reviewers from one wallet's cooldown, but it does not guarantee immediate liveness.
- External finalized withdrawal is intentionally limited to direct EOAs. The contract does not claim automatic recovery if an unsupported contract recipient rejects an external message.
- URL filtering is bounded and useful but is not a complete defense against DNS rebinding, alternate numeric IP spellings, or all future URL parser edge cases.
- V1 release checks do not automatically verify that every proof document, frontend default, CI record, and deployment record refer to the same release chain.

## Current test gaps

- No valid-mutant inventory or killed/survived report.
- No dedicated tests for zero bond, zero addresses, issuer/remedy collision, invalid source kind, duplicate anchors, malformed metadata, oversized statement/rule, or all creation boundary combinations.
- No exhaustive exact-boundary suite for immediately before/at/after maturity and immediately before/at/after deadline across every terminal state.
- No behavioral test proving duplicate expiry, duplicate conclusive action, post-terminal review, or retry after each terminal state is rejected without storage corruption.
- No full economic isolation/conservation matrix combining fulfilled, breached, inconclusive, and expired commitments with partial, repeated, overdrawn, zero, and unrelated-wallet withdrawals.
- No browser-level E2E suite and no automated accessibility/responsive checks.
- No benchmark definition/results artifact for GenLayer judgment calibration.
- No automated consistency gate for stale SHA, CI, Vercel, contract address, proof-file, and network references.

## GenLayer fit

V1 is materially GenLayer-native. The judgment path executes inside the Intelligent Contract using nondeterministic web retrieval and nondeterministic prompting, then passes a bounded result through `gl.eq_principle.strict_eq`. The contract—not a server—owns the evidence policy, timing, verdict parsing, and settlement authorization. Finalized child messages are used for cross-contract registration and settlement, while native value is kept in the Vault rather than moved through judgment messages.

The principal V2 question is not whether to add a generic AI layer. It is whether the existing intelligent judgment is calibrated conservatively, whether consensus requires byte-identical evidence or only economically safe agreement, and whether the evidence receipt exposes enough bounded provenance for a reviewer to understand what happened.

## Contract quality

V1 has unusually clear trust boundaries for a first release: immutable wiring, Vault-only registration, Registry-only settlement, immutable recipient derivation, replay-safe settlement, and debit-before-send withdrawal. The remaining quality work is adversarial proof rather than a claim that the current source is unsafe. The most important candidate hardening is to reject a zero Registry address in the Vault constructor and to add behavior-driven coverage for every economic and lifecycle boundary.

## Engineering

The frozen CI workflow runs Python surface tests, Direct Mode, simulator Registry tests, and frontend checks. The pinned contract CLI is `0.39.2`; `genlayer-test` is `0.29.2`; the frontend pins `genlayer-js` `0.9.0` and Next `16.4.0`. The baseline suite independently passed 20 full tests, 4 Direct Mode tests, 11 simulator tests, frontend typecheck, lint, board invariant, and production build. The managed Windows host lacks a working global Python launcher and has intermittent generated-directory EPERM behavior; Linux CI remains authoritative for the supported Direct Mode path.

The dependency audit has 0 production findings and 5 documented development-only high findings in the Next/ESLint transitive chain. No `npm audit fix --force` was applied.

## Product / demo weaknesses

- The homepage explains the protocol well, but a reviewer still has to infer the full 30–60 second story from several screens.
- There are no editable commitment templates/examples teaching precise statements, time-bearing verification rules, and durable anchors.
- A fresh board can look empty while still being correct; a reviewer-facing demo path should make the state machine and evidence receipts easier to understand without inventing fake production data.
- The UI is source-audited for responsive CSS and accessible labels, but that is weaker than browser-level verification of actual wallet and failure states.

## Release-evidence quality

V1 evidence is strong for the submitted deployment: exact contract addresses, deployment/wiring transactions, live lifecycle artifacts, expiry, withdrawal, CI, Vercel, and a clean final HEAD are recorded. Historical superseded artifacts remain present and are marked historical in the release docs. V2 still needs mutation results, frozen benchmark definitions/results, browser E2E classification, automated consistency checks, and an explicit decision on strict equality before it can be called submission-quality.

## Baseline scores

Scores are evidence-backed assessments of the frozen V1, not predictions of V2.

| Dimension | Score / 5 | Basis |
| --- | ---: | --- |
| GenLayer fit | 4.2 | Native nondeterministic web/prompt judgment, strict consensus, and finalized child messages; calibration and equivalence review are absent. |
| Contract quality | 4.1 | Strong bounded inputs, immutable wiring, lifecycle gates, replay-safe settlement, and withdrawal boundary; adversarial mutation/economic coverage is incomplete. |
| Engineering | 3.5 | Pinned toolchain, four-job CI, and meaningful simulator/Direct Mode coverage; no mutation gate, browser E2E, or automated release consistency gate. |
| Originality | 4.4 | Distinct public accountability register with frozen evidence and economic outcomes; no marketplace, dispute court, or copied reference mechanics. |
| Product usefulness | 3.8 | Useful for public time-bounded accountability, but templates and guided reviewer education are limited. |
| UX/demo clarity | 3.7 | Strong visual identity and explicit finality language; wallet/failure/responsive behavior lacks browser-level proof. |
| Evidence quality | 4.0 | Extensive live V1 proof matrix and exact provenance; no mutation or judgment calibration evidence. |

## Audit conclusion

V1 is a credible submitted release, not a finished security research artifact. V2 should concentrate on behavioral mutation proof, adversarial economic/lifecycle tests, a frozen judgment calibration corpus, browser E2E separation, and release consistency automation. No feature should be added unless it materially improves one of those trust boundaries or makes the GenLayer judgment easier to defend.
