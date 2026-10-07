# Contract implementation area

The implementation lives in `vowmark-contracts/` and targets the repository-local GenLayer CLI `0.39.1`.

- `vowmark_registry.py` freezes the commitment terms/evidence policy and owns validator review, outcome history and issuer indexes.
- `vowmark_vault.py` is the minimal finalized-only custody boundary for credits and withdrawals.
- `vowmark-contracts/deploy/deployScript.ts` deploys and wires both contracts, waiting for finalized receipts.

No live deployment is claimed until the resulting receipts, addresses and configuration have been independently read back from Studionet 61999.
