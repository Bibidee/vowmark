# VOWMARK Security and Trust Model

## Threat: issuer self-grading

**Risk:** the wallet that made the promise also decides whether it succeeded.

**Mitigation:** issuer can define the promise and evidence policy only before maturity. It cannot write a verdict, override validator judgment or choose a new remedy after the fact.

## Threat: vague commitments

**Risk:** validators are asked to judge language that has no externally verifiable meaning.

**Mitigation:** V1 is scoped to public evidence-verifiable commitments. The UI must warn or reject obviously uncheckable commitments where practical. The verifier prompt must preserve `INCONCLUSIVE` rather than invent certainty.

## Threat: issuer-selected weak evidence

**Risk:** issuer selects evidence anchors that are easy to remove or manipulate.

**Mitigation:** anchors are frozen and visible before maturity; the UI should strongly prefer durable/versioned/on-chain sources and expose source kind/origin. Weak evidence can legitimately result in `INCONCLUSIVE`, leaving a permanent unresolved record.

## Threat: source mutation after maturity

**Risk:** a page is edited after the deadline to make the promise appear timely.

**Mitigation:** validators must reason about deadline evidence, not merely current presence. Version-addressed/on-chain sources are preferred. If timing cannot be reliably established, return `INCONCLUSIVE`.

## Threat: source outage becomes breach

**Risk:** temporary 5xx/429/network failure causes economic punishment.

**Mitigation:** unavailability alone must not become `BREACHED`. Consistent unavailable evidence should normally produce `INCONCLUSIVE` and preserve the bond until retry/expiry.

## Threat: prompt injection in public evidence

**Risk:** fetched page/code tells the model to ignore VOWMARK rules or return a chosen verdict.

**Mitigation:** fetched content is untrusted DATA. Validator instructions must explicitly ignore any instructions embedded in evidence. Do not follow arbitrary secondary links contained in evidence.

## Threat: evidence divergence across validators

**Risk:** mutable web pages return different content to leader and validators.

**Mitigation:** consensus-critical material must bind the fetched source set and content snapshot/digest. If validators cannot reproduce materially equivalent evidence and verdict, no conclusive product state should be recorded.

## Threat: duplicate review / replay

**Risk:** repeated clicks or repeated transactions create duplicate attempts or economic consequences.

**Mitigation:** terminal checks, attempt nonces/IDs, snapshot-digest handling, a 5-minute per-reviewer cooldown, a 32-attempt-per-1-hour capacity epoch and idempotent settlement rules. One bond resolves once. This bounds one address's retry rate but does not make coordinated Sybil exhaustion impossible.

## Threat: unauthorized settlement

**Risk:** caller chooses a new payout recipient or amount after judgment.

**Mitigation:** recipient is determined from immutable issuance terms plus verdict. Amount is the locked bond, never an LLM-selected number.

## Threat: provisional finality exploited economically

**Risk:** a review transaction is `ACCEPTED` but not final, yet a later action withdraws the corresponding bond.

**Mitigation:** VOWMARK uses the finalized-only Vault boundary. Registry settlement messages carry no native value, and the Vault's idempotent credit is the only economic state transition. The frontend reads finalized state and refuses to call a withdrawal above finalized credit.

## Threat: frontend becomes source of truth

**Risk:** localStorage, cached UI state or optimistic transitions show a result not actually on-chain.

**Mitigation:** exact transaction hashes are recoverable, but all canonical state is reread from contracts after finalization and after page reload.

## Threat: accounting drift

**Risk:** locked + credited amounts exceed actual contract/vault balance or one commitment leaks into another.

**Mitigation:** explicit accounting invariants, debit-before-send withdrawal, direct-EOA caller gating, double-withdrawal tests, multiple-commitment isolation tests and live readback. GenLayer documents that an internal value transfer is deducted immediately and is not automatically returned if its child fails, so VOWMARK avoids internal value messages for settlement. Withdrawals use a finalized external transfer and require `sender_address == origin_address`, which bounds the supported path to a direct wallet caller; `sender_address` is the immediate caller and `origin_address` is the original submitter. An EOA has no contract code to reject the recipient-side transfer. A reverting contract recipient is outside the supported path; VOWMARK does not claim an automatic recovery callback because external messages are asynchronous and do not return a recovery value to the emitting contract. See the [GenLayer value-transfer documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/value-transfers), [message documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/messages), [transaction-context documentation](https://docs.genlayer.com/developers/intelligent-contracts/features/transaction-context) and [account documentation](https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/accounts-and-addresses).

## Threat: administrator override

**Mitigation:** V1 should contain no mutable admin method capable of changing verdicts, terms, remedy recipient, bond amount or terminal history.
