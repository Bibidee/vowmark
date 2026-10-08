# VOWMARK Economic Conservation Tests

The simulator harness exercises multiple simultaneous commitments, issuers,
remedies, lifecycle states, shared recipients, partial withdrawals, repeated
withdrawals, overdraws, unrelated wallets, and settlement retries.

The internal accounting target is:

```text
TOTAL BONDS RECEIVED
=
LOCKED COMMITMENT VALUE
+ OUTSTANDING CREDITS
+ CONFIRMED WITHDRAWN VALUE
```

## Covered invariants

- each bond remains associated with its own commitment;
- settlement credits exactly once;
- `FULFILLED` credits the issuer;
- `BREACHED` credits the remedy;
- `EXPIRED_UNRESOLVED` credits the issuer;
- an open `INCONCLUSIVE` commitment produces no credit;
- multiple commitments to one recipient aggregate correctly;
- partial withdrawal reduces only that recipient's credit;
- repeated withdrawal consumes only the remaining credit;
- overdraw and unrelated-wallet withdrawal are rejected.

## Boundary of the proof

The simulator proves internal Vault ledger conservation for the tested
commitment set. It does not expose a global native Vault balance primitive, so
the following remains explicitly limited:

```text
INTERNAL ACCOUNTING CONSERVATION: PROVEN
GLOBAL NATIVE BALANCE CONSERVATION: TOOLING-LIMITED
```
