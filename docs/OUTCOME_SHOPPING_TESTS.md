# VOWMARK Evidence Churn and Retry Identity

This artifact documents the current V2 behavior. Retry semantics are unchanged
and no semantic or LLM-based hashing is used.

## Identity rule

Each review snapshot is identified from the normalized URL, source kind,
availability status, returned content length, and SHA-256 digest of the returned
content. Exact repeated snapshots are rejected by `seen_snapshots`.

The identity is therefore a raw frozen source/snapshot identity, not an
authenticated canonical artifact identity.

## Adversarial coverage

The simulator tests exercise:

- exact content replay;
- original content plus whitespace;
- rotating banner text;
- irrelevant timestamp text;
- visitor-counter text;
- reordered equivalent facts;
- same content through a different URL/query representation;
- same-reviewer cooldown;
- 32-attempt epoch capacity;
- terminal-outcome review rejection;
- final-deadline review rejection.

Expected/current behavior:

| Change | Snapshot result |
| --- | --- |
| Exact same URL and exact same content | Same digest; rejected as duplicate |
| Raw content differs by whitespace or irrelevant text | New digest; eligible for a fresh review if other gates permit |
| Same content through a different URL/query | New digest because normalized URL is part of identity |
| Same reviewer before five minutes | Rejected by reviewer cooldown |
| Attempt 33 in one hour | Rejected by epoch capacity |
| Conclusive `FULFILLED` or `BREACHED` result | Further review rejected |
| At or after final review deadline | Further review rejected |

Different reviewers can submit changed snapshots immediately. The configured
deadline remains the final bound on retry activity. This mitigates spam and
permanent liveness exhaustion but does not provide material-equivalence
deduplication for mutable sources.

## Judgment parser boundary coverage

The simulator fixtures also cover invalid JSON, empty results, missing verdicts,
unknown verdicts, non-object JSON, fenced valid JSON, extra economic fields, a
duplicate `verdict` key, and hostile evidence text. Invalid cases create no
review record; fenced JSON is accepted; extra economic fields are ignored for
settlement; and Python's JSON parser uses the last duplicate key, so the
duplicate-key fixture resolves to the final `FULFILLED` value while remaining
inside the closed verdict enum.

An explicit maximum response size for the model output itself is not exposed by
the current mocked runtime path. Oversized model-output behavior is therefore
`TOOLING-LIMITED`; this pass does not claim a runtime limit that was not
observed.

Prompt-injection fixtures use deterministic mocked validator responses. They
exercise contract-level boundaries only; real validator resistance to hostile
instructions remains `TOOLING-LIMITED` because independent validator execution
was not performed.

Deterministic source-specific revision identities remain a future design option
for independently verifiable immutable sources only. A universal semantic hash
is intentionally not used.
