# VOWMARK live lifecycle baseline

Network: GenLayer Studionet (chain 61999)

Registry: `0xbE235FC7CFb88dd5e0627b5916d8A916dF8680d5`

Vault: `0x8AEBe9d98cDbB6460752d002C98D5E5745CA6533`

The baseline lifecycle run used finalized reads and recorded these outcomes:

- Commitment `#3`: `BREACHED`; review `0x7fd10af9b3b0bd7fe5f75296374e5653bc37398dcf2cfe5cdb94abcd89a0983e`; Vault credit readback `CREDIT_CONFIRMED` for `100000000000000` wei to the remedy address.
- Commitment `#4`: `INCONCLUSIVE`; review `0xd00d505d7d8567d3291054d9695c3d1fe144721cdd08a987cc3ab85a3bd6248c`; no settlement was emitted, preserving the retryable open state.
- The earlier GitHub candidates `#1` and `#2` were also conservatively recorded as `INCONCLUSIVE`; they are retained as public lifecycle records, not presented as fulfilled proofs.

The current fulfilled proof and withdrawal evidence is in [`live_fulfilled_pinned.json`](live_fulfilled_pinned.json).
