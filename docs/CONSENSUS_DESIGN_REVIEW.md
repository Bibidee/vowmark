# VOWMARK V2 Consensus Design Review

## Decision

**KEEP STRICT_EQ**

No consensus primitive change is accepted in V2, and no contract redeployment is authorized by this hardening branch.

## Existing design

The Registry returns `gl.eq_principle.strict_eq(evaluate)`. Each validator evaluates the same commitment, frozen anchor set, bounded evidence snapshots, and prompt. The returned object contains the economic verdict plus `snapshot_digest` and `source_set_digest`.

## Why this remains the safer choice

Strict equality makes validators agree on both the economic outcome and the evidence/provenance object used to justify it. That prevents a validator from reaching the same-looking verdict over a materially different source set or snapshot. It also keeps disagreement fail-closed instead of silently treating provenance divergence as economically equivalent.

The trade-off is brittleness: byte-different but materially equivalent fetches can fail consensus. V2 does not have an independently executed judgment benchmark or a safe equivalence oracle that could distinguish harmless representation differences from meaningful evidence divergence. Relaxing equality now would therefore expand the attack surface without evidence that the replacement is safer.

## Deferred design option

A future version could separate economic verdict equivalence from provenance agreement: first define a tightly specified canonical evidence receipt, then compare the canonical receipt and verdict under an independently measured equivalence relation. That requires a frozen corpus, validator runs, and adversarial disagreement testing before it can replace `strict_eq`.
