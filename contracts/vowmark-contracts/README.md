# VOWMARK contract package

This package contains the pinned GenLayer 0.39.1 Intelligent Contract implementation for VOWMARK.

- `contracts/vowmark_registry.py` owns immutable commitment terms, frozen evidence anchors, validator review, append-only history, issuer indexes and terminal product outcomes.
- `contracts/vowmark_vault.py` is the minimal finalized-only custody boundary. It accepts settlement only from the immutable registry address and owns credits/withdrawals.
- `deploy/deployScript.ts` deploys the registry, deploys the vault, then performs one-time pre-issuance wiring and waits for `FINALIZED` receipts.

The deployment sequence starts the Registry with a zero vault placeholder only to break the two-address bootstrap cycle. `set_vault_address` can be called only by the constructor deployer, only once, and only before the first commitment exists. After wiring, the address is immutable.

Run the version check from the repository root with the local CLI:

```text
npx genlayer --version
```

The expected result is `0.39.1`. Live deployment requires a funded wallet and a current Studionet RPC configuration; no deployment address is claimed until a finalized transaction has been observed.
