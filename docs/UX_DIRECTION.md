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

- near-black graphite base with bone text and high-contrast cyan, lime, violet and coral state accents;
- angular panels, clipped corners, protocol rails and evidence-cartridge treatments;
- editorial typography for the promise text and a compact monospace layer for hashes, rails and evidence metadata;
- dense but legible public-record composition: board groups, canonical record panels and visible settlement rails;
- no glassmorphism, fake metrics, fake activity or decorative dashboard noise;
- no copied reference cards/layouts; the Neon Oath Machine language is specific to VOWMARK.

## Mobile

Prioritize promise, deadline, status and primary action. Evidence details may collapse. Transaction progression should become a bottom sheet or compact stepper rather than unreadable side rails.
