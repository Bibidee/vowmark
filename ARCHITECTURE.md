# VOWMARK V1 Architecture Lock

## Canonical trust flow

```text
USER
-> NEXT.JS APP ROUTER + TYPESCRIPT FRONTEND
-> INJECTED EIP-1193 WALLET
-> GENLAYER STUDIONET 61999
-> VOWMARK CONTRACT LAYER
-> VALIDATOR WEB RETRIEVAL + SEMANTIC JUDGMENT
-> CANONICAL CONTRACT STATE
-> FRONTEND
```

## No application backend

Do not add Supabase, Firebase, Prisma, Postgres, MongoDB, Cloudflare Workers, Railway, Express, backend wallets, API decision services, authoritative Next.js API routes, authoritative Server Actions, cron, queues, server-side evidence fetchers, centralized AI inference, hidden moderator tools or admin adjudicators.

Static hosting is allowed. Browser local storage is allowed only for non-authoritative convenience such as remembering submitted transaction hashes. Canonical lifecycle, verdict, ownership, bond accounting and issuer history must always be reconstructed from GenLayer contract state.

## Contract count

Start from the minimum sensible architecture.

### Preferred V1

One `VowmarkRegistry` Intelligent Contract owns:

- commitment creation;
- locked bond accounting;
- immutable terms and evidence anchors;
- review attempts;
- validator judgment;
- outcome state;
- credits;
- withdrawals;
- issuer/global indexes.

### Finality exception

Before freezing one-contract custody, verify on the real pinned Studionet toolchain that an economically material credit/withdrawal cannot be exploited from merely `ACCEPTED` but not-finalized review state.

If current GenLayer semantics do **not** provide a defensible one-contract finality boundary, introduce exactly one minimal deterministic `VowmarkVault` whose only purpose is custody/credits/withdrawals. In that architecture:

- `VowmarkRegistry` performs judgment and owns commitment history.
- a conclusive registry result emits the settlement instruction only on the finalized boundary supported by the pinned GenLayer runtime;
- `VowmarkVault` accepts settlement messages only from the immutable registry address;
- the vault has no model calls and no semantic judgment;
- the registry cannot arbitrarily rewrite a settlement recipient or amount after issuance.

Do **not** add a second contract merely to look sophisticated. Document the final architecture and the real reason for it.

## Deterministic responsibilities

Keep these outside model judgment:

- caller authorization;
- value/bond checks;
- timestamp legality;
- maturity/review-window legality;
- URL count and syntax bounds;
- commitment immutability;
- remedy-address immutability;
- retry/cooldown rules;
- terminal-state checks;
- duplicate/replay protection;
- credit accounting;
- withdrawal accounting;
- issuer/global indexes;
- product-outcome persistence after consensus.

## Validator responsibilities

Validators decide only the bounded semantic question using the frozen evidence policy. They do not decide who the issuer is, whether a caller is authorized, how much GEN moves, who receives it or whether a lifecycle transition is legal.

## Canonical state model

The implementation may use a compact enum plus timestamps/flags rather than mirroring every UX phase literally.

The semantic states must at minimum distinguish:

- unresolved active commitment;
- retryable inconclusive state/history;
- conclusive fulfilled result;
- conclusive breached result;
- expired unresolved result;
- locked vs credited vs withdrawn economic state.

Do not use one overloaded status field if that makes economic settlement or transaction finality ambiguous.

## Seven-stage lifecycle mapping

1. **ISSUE** — issuer signs immutable commitment + value lock.
2. **ACTIVE** — promise is live and cannot be rewritten.
3. **MATURE** — deadline passed; commitment becomes reviewable.
4. **REVIEW** — a wallet requests validator assessment.
5. **JUDGMENT** — validators independently fetch frozen sources and reach a bounded semantic result.
6. **RESOLUTION / RECOVERY** — conclusive result waits for correct finality/economic handling; inconclusive can retry; consensus failure records no fake product verdict.
7. **SETTLEMENT + PERMANENT RECORD** — credits/withdrawals are correct and issuer history permanently reflects fulfilled, breached or unresolved outcome.

## Read model

The frontend must be able to reconstruct product state without a database. Provide practical paginated/bounded views for:

- total commitment count;
- commitment by ID;
- issuer commitment IDs;
- current lifecycle/result;
- review history;
- evidence anchors;
- pending credit by wallet;
- issuer summary counts;
- global board slices suitable for `/`.

Avoid a contract API that requires unbounded arrays in one call.

## Transaction lifecycle

The frontend must represent at least:

1. wallet approval requested;
2. signature rejected or signed;
3. transaction submitted with exact hash;
4. consensus progressing;
5. GenLayer `ACCEPTED` shown as provisional;
6. finalization/execution progressing;
7. final transaction state;
8. canonical contract readback;
9. expected VOWMARK state confirmed or mismatch surfaced.

Never treat protocol `UNDETERMINED` as product `INCONCLUSIVE`. If protocol consensus fails, no product verdict should be manufactured.
