# Contract implementation area

The implementation lives in `vowmark-contracts/` and has been schema-checked against the Studionet 61999 deployment CLI `0.39.2`.

- `vowmark_registry.py` freezes the commitment terms/evidence policy and owns validator review, outcome history and issuer indexes.
- `vowmark_vault.py` is the minimal finalized-only custody boundary for credits and withdrawals.
- `vowmark-contracts/deploy/deployScript.ts` deploys and wires both contracts, waiting for finalized receipts.

The current finalized Studionet deployment, configuration readback and lifecycle evidence are recorded in [`../HANDOFF_STATUS.md`](../HANDOFF_STATUS.md). The deployment CLI is pinned by `package.json`/`package-lock.json` to `genlayer@0.39.2`; use `npx --no-install genlayer ...` so deployment does not silently float to another CLI.

## Custody and withdrawal safety

The Vault receives the bond during issuance. Registry settlement messages carry no native value; they only authorize one idempotent credit. `withdraw` checks the caller's finalized credit, debits that credit before calling `emit_transfer(value=amount, on="finalized")`, and has no alternate payout amount or recipient parameter. Direct Mode covers insufficient-credit rejection, debit-before-send ordering, exact-once settlement and multiple-commitment isolation.

The withdrawal path accepts only a direct EOA caller (`gl.message.sender_address == gl.message.origin_address`) and sends the finalized amount to that sender. The credit is debited before the external finalized transfer. GenLayer's external-message semantics execute the EVM transfer at finalization, an EOA has no recipient contract code to reject the transfer, and internal value messages are not used for settlement. No automatic recovery callback is claimed for an unsupported contract recipient or an unmodeled protocol-level failure; the supported wallet path is direct EOA only. See the [GenLayer value-transfer documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers), [external-message documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/messages), [transaction-context documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/transaction-context) and [account documentation](https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/accounts-and-addresses).
