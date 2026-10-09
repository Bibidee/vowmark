# VOWMARK V4 release checklist

This checklist is for the `v4-security-remediation` branch. It does not authorize deployment or production promotion.

## Implementation gates

- [x] Studionet 61999 remains the only configured target.
- [x] Registry and Vault source changes compile in the simulator and Direct Mode.
- [x] URL normalization rejects credentials, control characters, local/private hosts, invalid ports, and non-HTTPS schemes.
- [x] `VERSIONED_SOURCE` requires a structurally immutable GitHub commit URL.
- [x] Unverified source classes are labeled explicitly and are not treated as authenticated authority.
- [x] Validator prompt separates immutable protocol instructions from hostile evidence/commitment records.
- [x] Validator output is bounded and parsed as one exact closed-schema JSON object with duplicate-key rejection.
- [x] Review capacity has a separately bounded four-attempt reserve in the final five minutes.
- [x] Withdrawal requires sender/origin equality and debits credit before external finalized transfer.
- [x] Frontend types, policy copy, evidence metadata, and board fixtures match the V4 schema.
- [x] Full Python suite: 63 passed.
- [x] Mutation gate: 36/36 valid mutants killed.
- [x] Frontend typecheck, lint, board test, and production build passed.
- [x] Release guard passed.
- [x] V4 release-consistency guard passed.

## Deployment gates

- [ ] Fresh V4 Registry deployment finalized and recorded.
- [ ] Fresh V4 Vault deployment finalized and recorded.
- [ ] Finalized Registry/Vault wiring readback recorded.
- [ ] Live V4 lifecycle canary recorded.
- [ ] Live V4 expiry proof recorded after the real deadline.
- [ ] Live V4 withdrawal proof recorded.
- [ ] V4 frontend deployed to a separate preview and browser-smoke-tested.
- [ ] Production promotion explicitly authorized.

Until every deployment gate is checked, V4 must remain undeployed and the authorized V1 production release must remain unchanged.
