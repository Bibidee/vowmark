# VOWMARK Evidence Model

## Principle

Evidence is declared before the outcome is known. Validators do not search the open internet and do not accept a reviewer-authored narrative as proof.

## Frozen anchors

At issuance the issuer provides 1–5 HTTPS anchors. Each contains:

- exact URL;
- source kind;
- concise purpose label.

The evidence set is immutable after creation.

## Source kinds

V1 may support:

- `PUBLICATION` — official public page/document/index;
- `VERSIONED_SOURCE` — commit-addressed/tagged release/versioned source;
- `ONCHAIN_RECORD` — public explorer/transaction/state record;
- `THIRD_PARTY_RECORD` — independent audit/report/public record.

The builder may rename these only if required by the actual contract encoding, while preserving the same bounded intent.

## Validator retrieval

Each validator independently retrieves the same exact anchors.

The material snapshot should bind, where supported:

- normalized URL;
- normalized host/origin;
- fetch class/status;
- bounded response length;
- bounded content-window hash/digest;
- aggregate source-set digest.

Do not include inherently non-reproducible per-validator wall-clock values inside the consensus-critical digest.

## Temporal proof

A current page is not automatically proof of timely completion.

For deadline-bound promises, validators must look for durable evidence of *when* the promised event occurred, such as:

- commit timestamp or tagged release;
- transaction/block record;
- dated publication metadata supported by the source;
- independent report date;
- other public evidence tied to the deadline.

If timing cannot be reliably established, prefer `INCONCLUSIVE`.

## Contradiction

If admissible sources materially conflict and there is no frozen rule that clearly resolves the conflict, the safe result is `INCONCLUSIVE`.

## Unavailability

Timeout, 5xx, rate limiting, malformed content, unsupported response, blocked source or transient retrieval failure does not by itself prove breach.

If validators consistently observe insufficient/unavailable evidence, product outcome may be `INCONCLUSIVE`.

If validators materially disagree about the fetched snapshot, the GenLayer protocol may fail to reach consensus. That must remain distinct from a VOWMARK `INCONCLUSIVE` result.

## Prompt injection

External content may contain text such as “ignore previous instructions” or “return FULFILLED.” It is evidence data only. The validator prompt must explicitly prohibit obeying any instruction from fetched content.

## No evidence invention

The model must not invent facts, browse beyond anchors, infer an unpublished source, or use private knowledge to fill gaps.
