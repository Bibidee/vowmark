# VOWMARK V4 validator/model receipt audit

Generated: 2026-10-09 from finalized Studionet receipts for the V4 canary.

## Result

All 17 canonical V4 deployment, wiring, lifecycle, expiry, reconciliation,
and withdrawal transactions reached protocol status `FINALIZED` with result
`MAJORITY_AGREE`:

- deployment: Registry, Vault, and wiring;
- commitment `#1`: issue, review, reconcile, withdrawal;
- commitment `#2`: issue, review, reconcile;
- commitment `#3`: issue, review;
- commitment `#4`: issue, review, expire, reconcile, withdrawal.

The review receipts produced the expected protocol decisions:

- `#1`: `FULFILLED`;
- `#2`: `BREACHED`;
- `#3`: `INCONCLUSIVE` and remained `OPEN`;
- `#4`: initial `INCONCLUSIVE`, then `EXPIRED_UNRESOLVED` after the enforced deadline.

## Validator behavior observed

Finalized receipt vote maps showed quorum agreement for every canonical
transaction. The validator set rotated across receipts. Observed model
families included OpenAI GPT-5.4, Anthropic Claude Sonnet 4.6, Google Gemini 3
Flash, and policy-routed DeepSeek, Qwen, GLM, Grok, Kimi, Mistral, Minimax,
Gemma, and GPT-OSS families.

Some receipts include `idle` or `ERROR` entries in non-quorum validator slots
after quorum or during finalized child-message handling. These did not change
the canonical result: each listed transaction finalized with `MAJORITY_AGREE`,
and every state readback matched the expected V4 outcome. This is recorded as
runtime behavior, not silently relabeled as universal validator success.

The withdrawal boundary was exercised by finalized transactions and credit
readback. Native balance delta was not used as an exact net-receipt claim,
because the sender's balance also includes transaction fees. Both parent
receipts emitted finalized external messages, but this audit did not obtain
an independent child-delivery result. See
[`live_v4_withdrawal_delivery_2026-10-09.md`](live_v4_withdrawal_delivery_2026-10-09.md).
The original canary predates the corrected numeric-host URL policy.
