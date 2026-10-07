# VOWMARK Frontend and UX Direction

## Product character

VOWMARK should feel like a public accountability register or signed public ledger, not a deal room, freelance marketplace, courtroom, prediction market or developer console.

## Required routes

### `/` — Maturity Board

Primary public surface. Group commitments into useful states such as:

- Due soon
- Ready for review
- Awaiting finality
- Recently resolved

Each record emphasizes the promise itself, issuer, maturity date, bond, remedy destination and plain-language status.

No fake metrics and no fabricated activity feed.

### `/issue`

Create a commitment:

- commitment statement;
- verification rule;
- maturity time;
- final review deadline;
- remedy address;
- bond amount;
- 1–5 evidence anchors with source kind + purpose;
- payload preview before signature;
- explicit warning that terms/evidence policy become immutable.

### `/commitment/[id]`

Canonical public record with this hierarchy:

1. promise text;
2. status + maturity;
3. issuer;
4. bond + remedy address;
5. verification rule;
6. frozen evidence anchors;
7. review history;
8. latest validator result;
9. transaction/finality rail;
10. settlement/withdrawal state.

Primary action is state-dependent: connect, request review, expire unresolved, withdraw credit, or none.

### `/issuer/[address]`

Public chronological record:

- active/reviewable;
- fulfilled;
- breached;
- expired unresolved.

Show counts, not an opaque reputation score.

### `/activity`

Local transaction recovery only:

- exact submitted hash;
- action type;
- locally remembered timestamp;
- reconciled live GenLayer status;
- link back to canonical commitment.

Never let local activity define commitment state.

## Status language

Use plain-language states such as:

- Live
- Ready for review
- Review submitted
- Decision accepted, awaiting finality
- Fulfilled
- Breached
- Inconclusive, retry available
- Expired unresolved
- Credit available
- Withdrawn

Do not use color alone for meaning.

## Visual direction

- off-white / paper-like base;
- deep graphite text;
- ultramarine primary accent;
- amber for provisional/review states;
- restrained green/red only for conclusive fulfilled/breached states;
- editorial typography for promise text;
- highly legible sans-serif for controls and data;
- generous whitespace;
- thin rules, ledger rows and evidence receipts;
- no glassmorphism;
- no neon;
- no blueprint grid;
- no protocol-terminal aesthetic;
- no copied reference cards/layouts.

## Mobile

Prioritize promise, deadline, status and primary action. Evidence details may collapse. Transaction progression should become a bottom sheet or compact stepper rather than unreadable side rails.
