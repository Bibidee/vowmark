# VOWMARK V2 Test Coverage and Evidence Matrix

This matrix distinguishes exact, non-overlapping test categories from aggregate
collection totals, browser checks, and tooling-limited work. It does not treat
an unrun benchmark or a passing typecheck as proof of validator correctness.

## V3 hardening supplement

The `v3-evidence-hardening` branch adds evidence-only regression coverage
without changing the frozen contract tree:

| Surface | Check | Result | Classification |
| --- | --- | --- | --- |
| Evidence churn and parser boundaries | `tests/sim/test_registry_behavior.py` | 32 passed after the V2 baseline | AUTOMATED |
| Multi-commitment custody conservation | `tests/sim/test_economic_accounting.py` | 1 passed | AUTOMATED |
| Full Python collection | `pytest tests -q` | 51 passed after the V2 baseline | AUTOMATED |
| Withdrawal evidence preparation | `scripts/withdrawal_evidence_helpers.mjs` | syntax-checked; live use remains separately authorized | TOOLING-LIMITED |

The V3 supplement is intentionally not a contract release or deployment claim.
It records raw evidence churn behavior, parser rejection boundaries, internal
ledger conservation, and the exact limits of recipient-balance observation.

## Executed automated coverage

| Surface | Check | Result | Classification |
| --- | --- | --- | --- |
| Vault Direct Mode | `pytest tests/direct -q` | 9 passed | AUTOMATED |
| Registry simulator | `pytest tests/sim -q` | 18 passed | AUTOMATED |
| Contract/source surface | `tests/test_contract_surface.py` | 5 passed | AUTOMATED |
| Mutation harness self-test | `tests/test_mutation_harness.py` | 4 passed | AUTOMATED |
| Full Python collection | `pytest tests -q --basetemp .pytest-v2-final` | 36 passed, aggregate of the four rows above | AUTOMATED |
| Contract syntax | `compileall` | PASS | AUTOMATED |
| Mutation gate | 31 valid mutants, 31 killed, 0 survived, 0 invalid, 0 tooling-limited; invalid/tooling-limited are blocking | PASS | AUTOMATED |
| Release consistency | frozen SHAs, V1 defaults, app/evidence ancestry, post-application path allowlist, Vercel wording, strict equality, mutation report | PASS | AUTOMATED |
| Judgment corpus | 24 frozen cases | Not executed; 24 tooling-limited | TOOLING-LIMITED |
| Web typecheck | `npm run typecheck` | PASS | AUTOMATED |
| Web lint | `npm run lint` | PASS | AUTOMATED |
| Board invariant | `npm run test:board` | PASS | AUTOMATED |
| Web production build | `npm run build` | PASS | AUTOMATED |
| Production dependency audit | `npm audit --omit=dev` | 0 vulnerabilities | AUTOMATED |
| Full development dependency audit | `npm audit --audit-level=high` | 5 high findings in existing ESLint/Next dev chain | KNOWN LIMITATION |

The 36-test full Python collection is an aggregate total, not an additional
category: 9 Direct Mode + 18 simulator + 5 contract/source surface + 4
mutation-harness self-tests = 36.

## Behavioral invariants covered

- zero Registry cannot initialize a Vault;
- zero bonds and zero remedies cannot create custody;
- issuer and remedy must differ;
- anchors are HTTPS, bounded, non-duplicated, and typed;
- statements and verification rules are bounded;
- maturity/deadline and review-window boundaries are enforced;
- only the immutable Vault registers commitments;
- only the immutable Registry confirms registration and settles;
- identical evidence snapshots cannot create duplicate reviews;
- unknown validator verdicts are rejected without a review record;
- unavailable or oversized evidence remains `INCONCLUSIVE`;
- terminal review and expiry replays are rejected;
- withdrawal is recipient-bound, caller-bound, nonzero, and debited before transfer;
- review capacity resets by epoch and cannot be exhausted permanently by one epoch.

## Browser E2E boundary

The Playwright suite is a browser-level UI check, not a chain or validator proof.

```text
DISTINCT E2E SCENARIOS: 19
PLAYWRIGHT EXECUTIONS: 38
PROJECTS: desktop Chromium, 390px mobile Chromium, 360px mobile Chromium, tablet Chromium
```

Distinct scenarios cover the public landing journey, issue validation and wallet
boundary, wallet rejection, wrong network, switch failure, account changes,
app-local Forget, keyboard/focus/labels/live announcements, canonical
commitment fallback, pending hash reload, ACCEPTED provisional state, finalized
execution failure, UNDETERMINED, registration pending, successful registration
retry/readback, stale local state precedence, and responsive controls. The suite
deliberately does not claim a live wallet signature, live transaction, validator
finality, or real judgment outcome.

## Tooling-limited gaps

- independent validator execution for the frozen judgment corpus;
- prompt-injection, link-following, temporal-conflict, and malformed-model mutation classes;
- failure recovery for an externally rejected withdrawal transfer;
- full global native-balance conservation where the local runtime does not expose the required balance primitive;
- Windows Direct Mode host SDK reliability; Linux CI remains authoritative for that surface.

## Release interpretation

The V2 branch has a zero-survivor result for the executable security mutation
set, but it is not a deployed replacement for V1 and does not claim live V2
contract or validator evidence. The appropriate release label must account for
that boundary.
