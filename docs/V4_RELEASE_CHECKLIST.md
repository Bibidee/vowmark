# VOWMARK V4 release checklist

This checklist is for the `v4-security-remediation` branch. The controlled
Studionet canary is historical and predates the final numeric-host fix.
Corrected V4 deployment and production promotion each require separate
authorization and are intentionally not performed here.

The production alias and addresses in [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md)
belong to V1 only. The original V4 canary has distinct addresses, but the
corrected V4 source has no assigned addresses until a fresh deployment is
separately authorized.

## Implementation gates

- [x] Studionet 61999 remains the only configured target.
- [x] Registry and Vault source changes compile in the simulator and Direct Mode.
- [x] GenVM AST lint passes both contracts; full SDK semantic `check` remains
  tooling-limited because the local linter's cache lacks the pinned SDK tar.
- [x] URL normalization rejects credentials, control characters, local/private hosts, alternate numeric-IP spellings, malformed host labels, invalid ports, and non-HTTPS schemes; explicit `:443` is canonicalized.
- [x] `VERSIONED_SOURCE` requires a structurally immutable GitHub commit URL.
- [x] Unverified source classes are labeled explicitly and are not treated as authenticated authority.
- [x] Validator prompt separates immutable protocol instructions from hostile evidence/commitment records.
- [x] Validator output is bounded and parsed as one exact closed-schema JSON object with duplicate-key rejection.
- [x] Normal review capacity remains available during the final five minutes; the four-attempt reserve is used only after the normal 32-attempt epoch quota is exhausted.
- [x] Final-five-minute epoch crossing resets only normal capacity and does not reset the commitment-scoped reserve.
- [x] Withdrawal requires sender/origin equality and debits credit before external finalized transfer.
- [x] Frontend types, policy copy, evidence metadata, and board fixtures match the V4 schema.
- [x] Corrected local full Python suite: 107 passed; simulator: 89 passed;
  Direct Mode: 9 passed. Earlier exact-head Linux `5e6a917` had 69 simulator
  passes; an older local report had 68 and is not relabeled as the same run.
- [x] Mutation gate: 49/49 valid mutants killed.
- [x] Frontend typecheck, lint, board test, timezone test, and production build passed.
- [x] Frontend Playwright browser suite: 38 passed across desktop/mobile/responsive and transaction recovery flows.
- [x] Release guard passed.
- [x] V4 release-consistency guard passed.
- [x] Registry/Vault URL decisions agree across simulator and Direct Mode coverage.
- [x] All four source classes expose explicit verified/unverified status without claiming provider or chain authentication.

## Deployment gates

- [x] Fresh V4 Registry deployment finalized and recorded.
- [x] Fresh V4 Vault deployment finalized and recorded.
- [x] Finalized Registry/Vault wiring readback recorded.
- [x] Live V4 lifecycle canary recorded for fulfilled, breached, and inconclusive outcomes.
- [x] Live V4 expiry proof recorded after the real deadline.
- [x] Historical V4 parent withdrawal calls, emitted external messages and
  credit readbacks recorded; independent delivery remains unverified.
- [x] Historical V4 frontend deployed to a separate preview and its routes
  and bundled addresses verified.
- [ ] Corrected V4 Registry/Vault deployment explicitly authorized and finalized.
- [ ] Corrected V4 preview wired to new addresses and live acceptance completed.
- [ ] `EXTERNAL_TRANSFER_DELIVERED` independently verified where supported.
- [ ] `PENDING AUTHORIZED REMEDY-WALLET SIGNATURE` resolved by wallet owner.
- [ ] Production promotion explicitly authorized.

Until production promotion is explicitly authorized, the authorized V1 production release must remain unchanged.
