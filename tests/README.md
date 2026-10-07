# VOWMARK verification

`test_contract_surface.py` is a fast release guard for the trust-boundary invariants that can be checked without a running Studio instance. The canonical GenLayer testing path is:

```text
python -m pytest tests -q
gltest --network studionet -v
```

The live GenLayer matrix must still be run with funded accounts and explicit mock/public evidence cases before a release can be called submission-ready. No synthetic test result is used as a live deployment claim.
