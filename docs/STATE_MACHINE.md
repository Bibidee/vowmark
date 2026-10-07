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

The final implementation may refine these names, but must preserve the distinctions.

## Timing

- Before maturity: no review.
- At/after maturity and before final review deadline: review allowed if commitment unresolved and retry rules permit.
- After a conclusive result: no more review.
- After final review deadline with no conclusive result: anyone may expire as `EXPIRED_UNRESOLVED`.

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
