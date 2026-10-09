# VOWMARK State Machine and Failure Behaviour

## Product phases

```text
ISSUE
  -> ACTIVE
  -> MATURE
  -> REVIEW
  -> JUDGMENT
  -> RESOLUTION / RECOVERY
  -> SETTLEMENT + PERMANENT RECORD
```

## Suggested canonical state representation

Keep storage smaller than the UX vocabulary. A sensible design is:

### Resolution state

- `OPEN`
- `FULFILLED`
- `BREACHED`
- `EXPIRED_UNRESOLVED`

`INCONCLUSIVE` should be represented in append-only review history and may remain the latest review result while resolution stays open, rather than pretending inconclusive is a terminal settlement.

### Economic state

- `LOCKED`
- `CREDITED`
- `WITHDRAWN`

Review history is append-only but read in bounded pages: `get_review_count(commitment_id)` reports the total and `get_reviews(commitment_id, start, limit)` returns at most 25 newest-first records per call. The frontend loads the newest page first and explicitly requests older pages.

Withdrawal is supported for a direct EOA caller only. The Vault requires `gl.message.sender_address == gl.message.origin_address`, debits finalized credit before the external finalized transfer, and does not claim automatic recovery for unsupported contract recipients.

The final implementation may refine these names, but must preserve the distinctions.

## Timing

- Before maturity: no review.
- At/after maturity and before final review deadline: review allowed if commitment unresolved and retry rules permit.
- After a conclusive result: no more review.
- After final review deadline with no conclusive result: anyone may expire as `EXPIRED_UNRESOLVED`.

The final review deadline must satisfy `final_review_deadline - maturity_at >= 1200` seconds (20 minutes). The same reviewer has a 300-second (5-minute) cooldown, the capacity epoch is 3,600 seconds (1 hour), and each epoch accepts at most 32 normal attempts. During the final five minutes, up to 4 additional reserve attempts are available only after normal capacity is exhausted. If the final five minutes cross an epoch boundary, the normal counter resets for the new epoch while the commitment-scoped reserve counter remains bounded across the final window. The maximum review window is 90 days.

Review liveness is permissioned, not guaranteed convergence: while a commitment is `OPEN` and inside the review window, a reviewer may submit only after that reviewer's 5-minute cooldown, with a changed snapshot, and while either normal capacity exists in the current 1-hour epoch or the final-five-minute reserve is available after normal capacity is exhausted. The configured normal capacity is 32 attempts per epoch and the late reserve is capped at 4 attempts across the final window; attempts are not lifetime-capped. Validator availability, consensus, and a conclusive verdict are not promised; if no conclusive result is finalized by the deadline, expiry remains the terminal path.

## Product outcome branches

```text
OPEN --review--> FULFILLED --> settlement/credit --> permanent fulfilled record
  |
  +--review--> BREACHED ----> settlement/credit --> permanent breached record
  |
  +--review--> INCONCLUSIVE --> cooldown --> review again
  |
  +--deadline--> EXPIRED_UNRESOLVED --> issuer credit --> permanent unresolved record
```

## Failure semantics

### Wallet disconnected

Reads remain available. Writes require wallet connection.

### Wrong chain

Writes disabled. Show explicit Studionet 61999 switch/add guidance.

### Signature rejected

No optimistic on-chain state. Preserve form inputs locally only if useful and non-authoritative.

### Transaction submission failure

Show the actual error. Do not invent a transaction hash.

### Transaction submitted

Persist exact hash for recovery convenience.

### GenLayer `ACCEPTED`

Show as provisional, not product finality.

### Protocol `UNDETERMINED`

Show “Consensus was not reached. No commitment result was recorded.” Reread contract state. Do not convert to product `INCONCLUSIVE`.

### Execution failure

No success banner. Reread canonical state and preserve the hash.

### Evidence unavailable

If consensus can reproduce the unavailable/insufficient snapshot, product result may be `INCONCLUSIVE`; bond remains locked.

### Evidence conflict

Prefer `INCONCLUSIVE` unless the frozen rule gives a clear resolution.

### Duplicate click / refresh

Recover from existing transaction hash; never blindly rebroadcast because polling timed out.

### Unauthorized transition

Contract rejects. UI role-awareness is convenience only, never security.

### Site failure

Canonical commitments and issuer history must still be readable later because no server/database owns product state.
