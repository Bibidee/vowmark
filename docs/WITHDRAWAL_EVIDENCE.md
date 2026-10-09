# VOWMARK Withdrawal Evidence

Withdrawal logic is unchanged:

- direct EOA caller only;
- `sender_address == origin_address`;
- credit is debited before the finalized external transfer.

The new dependency-free helper at
`scripts/withdrawal_evidence_helpers.mjs` prepares evidence capture, where the
GenLayer client supports it, for:

- recipient address;
- Vault credit before and after;
- recipient native balance before and after;
- withdrawal amount;
- withdrawal transaction hash;
- finalized receipt;
- protocol/execution status;
- observed balance delta.

If native balance querying is unavailable, the artifact records:

```text
RECIPIENT BALANCE VERIFICATION: TOOLING-LIMITED
```

When the withdrawal sender is also the recipient, the observed native balance
delta may include transaction fees. The tooling records the raw delta and does
not label it as exact received value unless fee semantics are available.

The helper is prepared for the separately authorized final smoke test; it does
not execute a live withdrawal by itself. Existing live artifacts prove
finalized withdrawal execution and Vault credit before/after. They do not yet
prove recipient balance movement because those older artifacts predate this
expanded capture.
