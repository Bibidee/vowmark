# Contract implementation area

The implementation lives in `vowmark-contracts/` and has been schema-checked against the Studionet 61999 deployment CLI `0.39.2`.

- `vowmark_registry.py` freezes the commitment terms/evidence policy and owns validator review, outcome history and issuer indexes.
- `vowmark_vault.py` is the minimal finalized-only custody boundary for credits and withdrawals.
- `vowmark-contracts/deploy/deployScript.ts` deploys and wires both contracts, waiting for finalized receipts.

The current finalized Studionet deployment, configuration readback and lifecycle evidence are recorded in [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md).
