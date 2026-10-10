# VOWMARK V4 release checklist

This checklist certifies the `v4-final-certification` release line and the
current Production V4 deployment. Historical V1 and earlier V4 reports remain
separate evidence and are not relabeled.

Current release identity:

- Production: [`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/)
- Frontend commit: `67afe8ef5b029bf54ef6f9cf18f811881532c240`
- Registry: `0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707`
- Vault: `0x7cd9B38266eC92024c938354c498245D34314bd7`
- Network: GenLayer Studionet `61999`

## Implementation gates

- [x] Studionet `61999` remains the only configured target.
- [x] Registry and Vault source changes compile in the simulator and Direct Mode.
- [x] GenVM AST lint passes both contracts; full SDK semantic `check` remains
  tooling-limited because the local linter's cache lacks the pinned SDK tar.
- [x] URL normalization rejects credentials, control characters, local/private
  hosts, alternate numeric-IP spellings, malformed host labels, invalid ports,
  and non-HTTPS schemes; explicit `:443` is canonicalized.
- [x] `VERSIONED_SOURCE` requires a structurally immutable GitHub commit URL.
- [x] Unverified source classes are labeled explicitly and are not treated as
  authenticated authority.
- [x] Validator prompt separates immutable protocol instructions from hostile
  evidence/commitment records.
- [x] Validator output is bounded and parsed as one exact closed-schema JSON
  object with duplicate-key rejection.
- [x] Normal review capacity remains available during the final five minutes;
  the four-attempt reserve is used only after normal capacity is exhausted.
- [x] Final-five-minute epoch crossing does not reset the commitment-scoped
  reserve.
- [x] Withdrawal requires sender/origin equality and debits credit before the
  external finalized transfer.
- [x] Frontend types, policy copy, evidence metadata, and board fixtures match
  the V4 schema.
- [x] Exact-head CI: simulator `90 passed`; Direct Mode `9 passed`; Python
  surface `10 passed`, `3` environment skips.
- [x] Mutation gate: `49/49` valid mutants killed.
- [x] Frontend typecheck, lint, browser suite (`44 passed`), and production
  build passed.
- [x] Production-only npm audit: `0` findings.
- [x] Development-only `braces` advisory remains disclosed; no patched upstream
  release was available and no unsafe major downgrade was applied.
- [x] Release guard and V4 release-consistency guard passed.
- [x] Registry/Vault URL decisions agree across simulator and Direct Mode
  coverage.
- [x] All four source classes expose explicit verified/unverified status without
  claiming provider or chain authentication.

## Deployment and live gates

- [x] Current V4 Registry deployment finalized and recorded.
- [x] Current V4 Vault deployment finalized and recorded.
- [x] Finalized Registry/Vault wiring readback recorded.
- [x] Production bundle contains the current pair, chain and Studio explorer.
- [x] Live V4 fulfilled result recorded for commitment `#1`.
- [x] Live V4 breached result recorded for commitment `#2`.
- [x] Live V4 inconclusive review recorded for commitment `#0`.
- [x] Live V4 real-deadline expiry recorded for commitment `#0`.
- [x] Issuer withdrawals finalized for fulfilled and expired records.
- [x] Remedy-wallet signature and withdrawal finalized for breached record.
- [x] Final Vault balance and liability readback reconciled to zero.
- [x] Brave manual smoke test completed for board, issue form, validation,
  commitment, issuer and activity routes.
- [x] Sparse/out-of-order registration regression and duplicate retry test
  passed; no material large-gap failure reproduced.
- [ ] Independent child-transaction delivery receipt: unavailable from the
  pinned Studio SDK/RPC; parent finality, external-message emission and Vault
  credit debit are verified instead.
- [ ] Cryptographic source-to-bytecode attestation: unavailable from the
  configured Studio tooling; deployment/configuration/live behavior are
  recorded without inferring bytecode from Git alone.

## Exact-head evidence

- GitHub Actions: [run 38021463258](https://github.com/Bibidee/vowmark/actions/runs/38021463258)
- Current evidence: [`../evidence/live_v4_final_submission_2026-10-10.md`](../evidence/live_v4_final_submission_2026-10-10.md)
