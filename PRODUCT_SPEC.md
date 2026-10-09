# VOWMARK V4 Candidate Product Specification

This document describes the **V4 candidate** on the
`v4-security-remediation` branch. It is not the specification of the
authorized production V1 contracts. V1 production uses the original
15-minute minimum review window. A historical V4 canary uses 20 minutes, but
predates the final numeric-host URL fix. Corrected V4 code needs a new
Registry/Vault deployment and live acceptance before promotion.

## Product sentence

A public commitment bond where a wallet locks GEN behind an externally verifiable promise and GenLayer validators later determine, from frozen public evidence rules, whether that promise was fulfilled by its deadline.

## Primary users

Web3 teams, open-source builders, grant recipients, public-goods teams and organizations making externally verifiable commitments such as:

- publish an independent security audit before launch;
- release a named version before a date;
- open-source a promised implementation before a date;
- publish a governance or transparency report before a vote;
- complete a publicly inspectable grant deliverable before a deadline.

V4 is intentionally not for subjective promises such as “make the community happy,” “build a beautiful product,” or “provide excellent service.”

## Core problem

Public promises are cheap when the person making the promise can later reinterpret success, choose the evidence after the fact or grade themselves. VOWMARK freezes the promise, deadline, remedy address and evidence policy before maturity, then removes unilateral outcome control from the issuer.

## Roles

### Issuer

Creates the commitment, locks the bond, selects an immutable remedy address, freezes the verification rule and public evidence anchors, and cannot set or override the verdict.

### Reviewer

Any wallet may trigger a review after maturity and before the final review deadline, subject to retry/cooldown rules. In V4 the reviewer does **not** provide a free-form complaint and does **not** get to redefine the evidence policy.

### Remedy address

An immutable non-issuer address selected at issuance. If the commitment is conclusively `BREACHED`, this address becomes the economic recipient of the bond. It has no judgment authority.

### Validators

Independently retrieve only the frozen admissible public sources, treat all fetched content as hostile data, evaluate the frozen semantic question and reproduce the consensus-critical result.

## Commitment record

Each commitment must contain at minimum:

- stable commitment ID;
- issuer address;
- immutable remedy address;
- commitment statement;
- immutable verification rule;
- creation time;
- maturity/deadline time;
- final review deadline;
- bond amount;
- 1–5 frozen evidence anchors;
- lifecycle status;
- review attempt count;
- latest evidence snapshot digest where applicable;
- conclusive verdict, if any;
- settlement/credit status;
- resolution timestamp;
- append-only review history.

The implementation may refine exact storage layout for GenLayer compatibility, but must not weaken these semantics.

## Evidence anchors

Each anchor is frozen at issuance and contains at minimum:

- exact HTTPS URL;
- source kind;
- short human-readable purpose/label.

Supported V4 source kinds:

- `PUBLICATION`
- `VERSIONED_SOURCE`
- `ONCHAIN_RECORD`
- `THIRD_PARTY_RECORD`

The names can be adjusted only for a concrete implementation reason. Do not turn source kinds into a hidden ranking system or centralized authority registry.

V4 does not crawl the open internet. Validators fetch only the frozen URLs. V4 also does not accept arbitrary reviewer-supplied uploads or free-form evidence dumps.

## Admissibility and safety

- HTTPS only.
- Reject malformed URLs.
- Reject localhost, loopback, private-network and credential-bearing URL forms as far as practical.
- Bound URL length.
- Bound number of anchors.
- Bound fetched bytes/text.
- Do not silently truncate oversized evidence and then approve it.
- Do not follow arbitrary URLs embedded inside fetched content.
- Treat page text, source code, comments, README instructions and model-like prompts as untrusted evidence data.
- A source being unavailable is not automatically a breach.
- A mutable source merely existing at review time is not automatically proof that the commitment was satisfied by the original deadline.
- Evidence must establish the temporal condition where the promise is deadline-bound.

## Main intelligent question

The semantic question is fixed around this meaning:

> Under the commitment and verification rule exactly as recorded, and considering only the frozen admissible public evidence, does the evidence establish that the commitment was fulfilled by the stated maturity deadline?

Validators must return one of:

### `FULFILLED`

Accessible evidence materially establishes that the frozen commitment was satisfied by the stated deadline.

### `BREACHED`

Accessible evidence materially establishes that the frozen commitment was not satisfied by the stated deadline.

This outcome requires positive evidence of non-fulfillment, lateness or contradiction. Pure source outage must not silently become breach.

### `INCONCLUSIVE`

The available admissible evidence is insufficient for a reliable `FULFILLED` or `BREACHED` decision because it is missing, unavailable, stale, contradictory, ambiguous, malformed, temporally insufficient or otherwise unreliable.

`INCONCLUSIVE` is a first-class safe non-decision.

## Review attempts

- Anyone may trigger review only after maturity.
- No review after a conclusive terminal verdict.
- Reviews must stop after the final review deadline.
- Inconclusive attempts are append-only.
- The final review deadline must be at least 20 minutes after maturity.
- The same reviewer may retry after 5 minutes only when the evidence snapshot changes.
- The exact same evidence snapshot must not create unbounded duplicate history.
- Review capacity is bounded at 32 accepted attempts per 1-hour epoch to limit Sybil throughput without imposing a permanent lifetime attempt cap on an open commitment.
- The final five minutes keep using normal epoch capacity while it remains available; after normal capacity is exhausted, up to 4 reserve attempts are available until the deadline. If the final five minutes cross an epoch boundary, normal capacity resets for the new epoch while the reserve remains bounded across the final window.
- A new attempt is meaningful only if time or source content may have changed.

The maximum review window is 90 days. A coordinated Sybil set may still temporarily consume one hourly epoch; the contract does not claim Sybil griefing is impossible.

## Expiry

If no reliable conclusive verdict exists by the final review deadline, anyone may finalize the commitment as `EXPIRED_UNRESOLVED`.

`EXPIRED_UNRESOLVED`:

- is not `FULFILLED`;
- is not `BREACHED`;
- must remain visible forever in issuer history;
- returns the unresolved bond according to the V4 policy to the issuer;
- does not allow the UI to imply success.

## Economic semantics

- Creation locks exactly the declared bond.
- `FULFILLED` → bond becomes issuer credit.
- `BREACHED` → bond becomes remedy-address credit.
- `EXPIRED_UNRESOLVED` → bond becomes issuer credit but the unresolved record remains permanent.
- `INCONCLUSIVE` before expiry → bond remains locked.
- One bond can be resolved once.
- Withdrawals are separate from verdict judgment.
- Double withdrawal is impossible.
- Accounting must never create value.

## Issuer history

The protocol should expose backendless read paths for an issuer’s commitments and summary counts:

- active/reviewable;
- fulfilled;
- breached;
- expired unresolved.

Do not introduce an opaque reputation score in V4. The public record is the product.

## Non-goals

Do not build:

- buyer/seller flows;
- freelance delivery;
- clause-by-clause disputes;
- a jury product;
- generic arbitration;
- prediction markets;
- legal enforcement;
- a token;
- governance;
- social feeds/comments/likes;
- private evidence;
- arbitrary file uploads;
- open-web fact checking;
- backend AI;
- server-side monitoring;
- automatic cron-triggered reviews;
- multiple chains;
- administrator outcome overrides.
