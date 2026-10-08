# VOWMARK V2 Test Coverage and Evidence Matrix

This matrix distinguishes executed automated checks from browser checks and from work that remains tooling-limited. It does not treat an unrun benchmark or a passing typecheck as proof of validator correctness.

## Executed automated coverage

| Surface | Check | Result | Classification |
| --- | --- | --- | --- |
| Vault Direct Mode | Constructor, custody, settlement, registration, withdrawal, input bounds | 9 passed | AUTOMATED |
| Registry simulator | Timing, review lifecycle, wiring, anchor policy, parser, evidence bounds, replay, capacity | 18 passed | AUTOMATED |
| Full Python surface | `pytest tests -q --basetemp .pytest-v2-final` | 32 passed | AUTOMATED |
| Contract syntax | `compileall` | PASS | AUTOMATED |
| Mutation gate | 31 valid mutants, 31 killed, 0 survivors | PASS | AUTOMATED |
| Judgment corpus | 24 frozen cases | Not executed; 24 tooling-limited | TOOLING-LIMITED |
| Web typecheck | `npm run typecheck` | PASS | AUTOMATED |
| Web lint | `npm run lint` | PASS | AUTOMATED |
| Board invariant | `npm run test:board` | PASS | AUTOMATED |
| Web production build | `npm run build` | PASS | AUTOMATED |
| Production dependency audit | `npm audit --omit=dev` | 0 vulnerabilities | AUTOMATED |
| Full development dependency audit | `npm audit --audit-level=high` | 5 high findings in existing ESLint/Next dev chain | KNOWN LIMITATION |

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

The Playwright suite is a browser-level UI check, not a chain or validator proof. It executed 10 tests across desktop Chromium and mobile-sized Chromium. It covers the landing page, navigation, issue-form validation, wallet-absent behavior, commitment trace UI, mobile layout, and horizontal-overflow regression. It deliberately does not claim a wallet signature, live transaction, finalized child message, or real judgment outcome.

## Tooling-limited gaps

- independent validator execution for the frozen judgment corpus;
- prompt-injection, link-following, temporal-conflict, and malformed-model mutation classes;
- failure recovery for an externally rejected withdrawal transfer;
- full global native-balance conservation where the local runtime does not expose the required balance primitive;
- Windows Direct Mode host SDK reliability; Linux CI remains authoritative for that surface.

## Release interpretation

The V2 branch has a zero-survivor result for the executable security mutation set, but it is not a deployed replacement for V1 and does not claim live V2 contract or validator evidence. The appropriate release label must account for that boundary.
