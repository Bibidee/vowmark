# VOWMARK V4 mutation test report

The V4 mutation harness is [`scripts/run_mutation_tests.py`](../scripts/run_mutation_tests.py). Each mutant is copied into an isolated scratch workspace, compiled, and exercised against the relevant simulator or Direct Mode behavioral suite. `SURVIVED`, `INVALID`, and `TOOLING-LIMITED` are release-blocking outcomes.

## Final run

- Branch: `v4-security-remediation`
- Runtime: `genlayer-test 0.29.2`, simulator and Direct Mode
- Command: `.venv-direct/Scripts/python.exe -u scripts/run_mutation_tests.py`

```text
TOTAL GENERATED: 36
VALID: 36
KILLED: 36
SURVIVED: 0
EQUIVALENT: 0
INVALID: 0
TOOLING-LIMITED: 0
```

## Inventory

| ID | Invariant attacked | Suite | Result |
| --- | --- | --- | --- |
| R-01 | review before maturity is rejected | simulator | KILLED |
| R-02 | review at/after final deadline is rejected | simulator | KILLED |
| R-03 | terminal commitments cannot be reviewed | simulator | KILLED |
| R-04 | expiry before the final deadline is rejected | simulator | KILLED |
| R-05 | review capacity resets in a new epoch | simulator | KILLED |
| R-06 | the 33rd normal review is rejected | simulator | KILLED |
| R-07 | identical evidence snapshots cannot replay | simulator | KILLED |
| R-08 | epoch identity is not lifetime-global | simulator | KILLED |
| R-09 | verdict is a closed enum | simulator | KILLED |
| R-10 | oversized evidence is excluded | simulator | KILLED |
| R-11 | unavailable evidence cannot become fulfillment | simulator | KILLED |
| R-12 | initial wiring is deployer-only | simulator | KILLED |
| R-13 | late reserve capacity is bounded | simulator | KILLED |
| R-14 | duplicate JSON keys cannot select a verdict | simulator | KILLED |
| R-15 | versioned sources require immutable revisions | simulator | KILLED |
| R-16 | fenced JSON is normalized before strict parsing | simulator | KILLED |
| V-01 | zero bond cannot create custody | Direct Mode | KILLED |
| V-02 | zero Registry cannot initialize Vault | Direct Mode | KILLED |
| V-03 | only Registry can settle | Direct Mode | KILLED |
| V-04 | settlement requires registration | Direct Mode | KILLED |
| V-05 | settlement credits exactly once | Direct Mode | KILLED |
| V-06 | breach credits the immutable remedy | Direct Mode | KILLED |
| V-07 | zero withdrawal is rejected | Direct Mode | KILLED |
| V-08 | withdrawal cannot exceed credit | Direct Mode | KILLED |
| V-09 | mediated withdrawal is rejected | Direct Mode | KILLED |
| V-10 | credit is debited before transfer | Direct Mode | KILLED |
| V-11 | only Registry confirms registration | Direct Mode | KILLED |
| V-12 | remedy cannot be zero | Direct Mode | KILLED |
| V-13 | issuer and remedy cannot match | Direct Mode | KILLED |
| V-14 | evidence anchors require HTTPS | Direct Mode | KILLED |
| V-15 | duplicate anchors are rejected | Direct Mode | KILLED |
| V-16 | anchor count is bounded | Direct Mode | KILLED |
| V-17 | statement size is bounded | Direct Mode | KILLED |
| V-18 | verification-rule size is bounded | Direct Mode | KILLED |
| V-19 | deadline must be after maturity | Direct Mode | KILLED |
| V-20 | versioned-source identity cannot be skipped | Direct Mode | KILLED |

The inventory tests executable control-flow and economic invariants. It does not claim that local mocks prove the quality of a live validator model, provider ownership, or runtime features that are not exposed by the pinned SDK.
