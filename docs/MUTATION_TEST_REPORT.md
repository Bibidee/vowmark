# VOWMARK V2 Mutation Test Report

The executable mutation harness is [`scripts/run_mutation_tests.py`](../scripts/run_mutation_tests.py). It copies one contract source mutation into a workspace scratch directory, compiles the mutated source, runs the relevant behavioral suite with that source path injected, and classifies the result. Compilation failures and harness failures are not counted as killed mutants.

## Run

- Branch: `v2-hardening`
- Base: `97b5ca8888eeaca3d2b1deb733c832c8448d4383`
- Runtime: `genlayer-test 0.29.2`, simulator/Direct Mode on the managed Windows host
- Suites: `tests/sim/test_registry_behavior.py`, `tests/direct/test_vowmark_vault_direct.py`
- Executed command: `.venv-direct/Scripts/python.exe scripts/run_mutation_tests.py`

```text
TOTAL GENERATED: 31
VALID: 31
KILLED: 31
SURVIVED: 0
EQUIVALENT: 0
INVALID: 0
TOOLING-LIMITED: 0
```

Security-relevant valid survivors: `0`.

## Mutant inventory

| ID | Source location | Invariant attacked | Reaching/killing behavioral test | Result |
| --- | --- | --- | --- | --- |
| R-01 | Registry review maturity guard | Review before maturity is rejected | `test_review_window_boundaries_and_review_at_exact_maturity` | KILLED |
| R-02 | Registry review deadline guard | Review at/after deadline is rejected | `test_review_deadline_and_expiry_boundaries_are_exact` | KILLED |
| R-03 | Registry terminal review guard | Terminal commitments cannot be reviewed | `test_registry_write_callers_and_terminal_replays_are_rejected` | KILLED |
| R-04 | Registry expiry deadline guard | Expiry before deadline is rejected | `test_review_deadline_and_expiry_boundaries_are_exact` | KILLED |
| R-05 | Registry epoch reset | Capacity resets in the next epoch | `test_sybil_reviewers_cannot_exhaust_future_review_capacity` | KILLED |
| R-06 | Registry epoch capacity guard | Attempt 33 in one epoch is rejected | `test_sybil_reviewers_cannot_exhaust_future_review_capacity` | KILLED |
| R-07 | Registry snapshot replay guard | Identical snapshots cannot create a second attempt | `test_rejected_duplicate_snapshot_does_not_mutate_history` | KILLED |
| R-08 | Registry epoch calculation | Capacity is not lifetime-global | `test_sybil_reviewers_cannot_exhaust_future_review_capacity` | KILLED |
| R-09 | Registry verdict parser | Unknown model verdicts are rejected | `test_unknown_validator_verdict_is_rejected_without_a_review_record` | KILLED |
| R-10 | Registry evidence-size guard | Oversized evidence is excluded from judgment | `test_unavailable_or_oversized_evidence_stays_inconclusive` | KILLED |
| R-11 | Registry unavailable-evidence branch | Unavailable evidence cannot become fulfillment | `test_unavailable_or_oversized_evidence_stays_inconclusive` | KILLED |
| R-12 | Registry initial wiring authorization | Only the deployer can wire initially | `test_vault_constructor_and_registry_wiring_are_nonzero_and_immutable` | KILLED |
| V-01 | Vault zero-bond guard | Zero bond cannot create custody | `test_vault_rejects_zero_bond` | KILLED |
| V-02 | Vault constructor Registry guard | Zero Registry cannot initialize Vault | `test_vault_rejects_zero_registry_constructor` | KILLED |
| V-03 | Vault settlement caller guard | Only Registry can settle | `test_vault_rejects_non_registry_settlement` | KILLED |
| V-04 | Vault registration guard | Settlement requires registration | `test_vault_rejects_settlement_before_registration` | KILLED |
| V-05 | Vault settlement idempotence | One bond cannot be credited twice | `test_vault_credits_exactly_once_after_registration` | KILLED |
| V-06 | Vault recipient derivation | Breach credits the immutable remedy | `test_vault_rejects_withdrawal_above_credit_and_debits_before_send` | KILLED |
| V-07 | Vault zero-withdrawal guard | Zero withdrawal is rejected | `test_vault_rejects_withdrawal_above_credit_and_debits_before_send` | KILLED |
| V-08 | Vault overdraw guard | Withdrawal cannot exceed credit | `test_vault_rejects_withdrawal_above_credit_and_debits_before_send` | KILLED |
| V-09 | Vault sender/origin guard | Mediated withdrawal is rejected | `test_vault_rejects_withdrawal_above_credit_and_debits_before_send` | KILLED |
| V-10 | Vault debit ordering | Credit is debited before transfer | `test_vault_rejects_withdrawal_above_credit_and_debits_before_send` | KILLED |
| V-11 | Vault registration caller guard | Only Registry confirms registration | `test_vault_rejects_non_registry_registration_confirmation` | KILLED |
| V-12 | Vault remedy nonzero guard | Remedy cannot be zero | `test_vault_rejects_invalid_creation_roles_and_anchor_policy` | KILLED |
| V-13 | Vault issuer/remedy distinction | Issuer cannot equal remedy | `test_vault_rejects_invalid_creation_roles_and_anchor_policy` | KILLED |
| V-14 | Vault HTTPS guard | Anchors require HTTPS | `test_vault_rejects_invalid_creation_roles_and_anchor_policy` | KILLED |
| V-15 | Vault duplicate-anchor guard | Anchors cannot duplicate | `test_vault_rejects_invalid_creation_roles_and_anchor_policy` | KILLED |
| V-16 | Vault anchor-count bound | More than five anchors are rejected | `test_vault_rejects_invalid_creation_roles_and_anchor_policy` | KILLED |
| V-17 | Vault statement bound | Statement size is bounded | `test_vault_rejects_invalid_creation_roles_and_anchor_policy` | KILLED |
| V-18 | Vault verification-rule bound | Rule size is bounded | `test_vault_rejects_invalid_creation_roles_and_anchor_policy` | KILLED |
| V-19 | Vault deadline ordering | Deadline must be after maturity | `test_vault_rejects_invalid_creation_roles_and_anchor_policy` | KILLED |

## Explicitly deferred mutation classes

These are not included in the 31-mutant score because the current local simulator cannot validate the attacked behavior without independent validator execution or a controllable cross-contract failure primitive:

- prompt injection changing model instructions;
- following secondary links beyond frozen anchors;
- historical temporal-proof reasoning and contradictory-source calibration;
- malformed-model fallback variants that require a real model response policy;
- source-set digest disagreement and alternative `strict_eq` equivalence semantics;
- model-selected bond/recipient mutations, which are not executable data paths in the current source;
- failed external withdrawal recovery callbacks;
- suppressed initial finalized child-message delivery;
- full global custody conservation against a runtime-exposed Vault balance.

Those gaps are recorded as `TOOLING-LIMITED` in the V2 coverage artifact. They are not counted as killed, survived, or equivalent mutants.
