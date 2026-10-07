# VOWMARK verification

`test_contract_surface.py` is a fast release guard for the trust-boundary invariants that can be checked without a running Studio instance. The canonical GenLayer testing path is:

```text
python -m pytest tests -q
gltest --network studionet -v
```

The live GenLayer matrix is recorded separately from synthetic tests. Current finalized Studionet evidence is in [`../evidence/live_fulfilled_pinned.json`](../evidence/live_fulfilled_pinned.json) and [`../evidence/live_lifecycle_baseline.md`](../evidence/live_lifecycle_baseline.md). No synthetic test result is used as a live deployment claim.
