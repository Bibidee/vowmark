# VOWMARK V4 final submission handoff — 2026-10-10

## Decision

**SUBMISSION READY WITH DISCLOSED LIMITATIONS**

VOWMARK V4 is the public accountability register at
[`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/). An issuer
freezes a public promise, the exact verification rule, a deadline, a remedy
address and admissible evidence anchors, then locks a GEN bond. After maturity,
GenLayer validators retrieve only those frozen public anchors and use
Intelligent Contract judgment to return `FULFILLED`, `BREACHED` or
`INCONCLUSIVE`. Contract logic keeps custody and settlement deterministic:
fulfilled and expired-unresolved bonds return to the issuer, while a breach
credits the immutable remedy address.

## Submission identity

- Repository: [`https://github.com/Bibidee/vowmark`](https://github.com/Bibidee/vowmark)
- Source branch: [`v4-final-certification`](https://github.com/Bibidee/vowmark/tree/v4-final-certification)
- Exact source commit: [`67afe8ef5b029bf54ef6f9cf18f811881532c240`](https://github.com/Bibidee/vowmark/tree/67afe8ef5b029bf54ef6f9cf18f811881532c240)
- Exact-head CI: [GitHub Actions run 38021463258](https://github.com/Bibidee/vowmark/actions/runs/38021463258)
- Network: GenLayer Studionet, chain `61999`
- Registry: [`0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707`](https://explorer-studio.genlayer.com/address/0xA3319fE2B8BCFEEe819284FF5dA90F0BAb3B8707)
- Vault: [`0x7cd9B38266eC92024c938354c498245D34314bd7`](https://explorer-studio.genlayer.com/address/0x7cd9B38266eC92024c938354c498245D34314bd7)
- Registry deployment: [`0x5701dc1cc4e401ba1d2fac4c33f7569066cb0b5a09640399ba668137472909a6`](https://explorer-studio.genlayer.com/tx/0x5701dc1cc4e401ba1d2fac4c33f7569066cb0b5a09640399ba668137472909a6)
- Vault deployment: [`0xf51dc5f59ecd5f13993a559d810e9266138227f8d788ef0d71d7a70daa375a33`](https://explorer-studio.genlayer.com/tx/0xf51dc5f59ecd5f13993a559d810e9266138227f8d788ef0d71d7a70daa375a33)
- Wiring: [`0x4617ff6909478706602912b3ea135c1b234088d1c080486d8d5407218aa92a2b`](https://explorer-studio.genlayer.com/tx/0x4617ff6909478706602912b3ea135c1b234088d1c080486d8d5407218aa92a2b)

## Economic proof

Current-pair live records:

- [Fulfilled #1](https://the-vowmark.vercel.app/commitment/1): finalized
  review, settlement and issuer withdrawal.
- [Breached #2](https://the-vowmark.vercel.app/commitment/2): finalized
  breach settlement to the immutable remedy wallet and finalized remedy-wallet
  withdrawal [`0x524ae773…d6d46cd`](https://explorer-studio.genlayer.com/tx/0x524ae773a04952d8e39f16ce9640166d42a097146d0be9fa1e280ca11d6d46cd).
- [Inconclusive then expired #0](https://the-vowmark.vercel.app/commitment/0):
  first review was `INCONCLUSIVE`; after the real deadline it became
  `EXPIRED_UNRESOLVED` and the issuer withdrew.
- Invalid payable issuance recovery is preserved as historical evidence on the
  superseded pair in [`live_v4_final_rejected_value_2026-10-09.json`](../evidence/live_v4_final_rejected_value_2026-10-09.json).

Final current-Vault readback: native balance `0 GEN`, locked bonds `0 GEN`,
issuer credit `0 GEN`, remedy credit `0 GEN`, accounted liabilities `0 GEN`.

## Security posture

- Critical: none reproduced.
- High: no production dependency findings; the development tree retains the
  disclosed unpatched `braces` advisory through Next lint tooling.
- Medium: no material live vulnerability reproduced. Large sparse registration
  gaps remain a practical backward-scan cost limitation, not a demonstrated
  exploit; source-to-bytecode attestation is unavailable from Studio.
- Low/informational: DNS rebinding, redirect-to-private-host behavior and
  renderer-specific fetch policy remain runtime-owned; the pinned runtime does
  not expose an independent child-transfer delivery receipt.

The source enforces immutable settlement recipients, sender/origin withdrawal
authorization, debit-before-send withdrawal, double-credit protection,
20-minute minimum review windows, five-minute per-reviewer cooldowns, 32 normal
hourly attempts, a four-attempt final-window reserve, normalized evidence URLs,
bounded exact validator-output parsing and replay-safe sparse registration.

## Full evidence

The detailed release evidence, browser smoke results, accounting table,
transaction matrix and limitations are in
[`../evidence/live_v4_final_submission_2026-10-10.md`](../evidence/live_v4_final_submission_2026-10-10.md).

No demo-video URL was available in the repository or task artifacts, so none is
invented here.
