# VOWMARK V1 handoff status

VOWMARK V1 is deployed on GenLayer Studionet 61999 and published at [the-vowmark.vercel.app](https://the-vowmark.vercel.app). The canonical deployment and evidence are documented in [`evidence/FINAL_PROOF_MATRIX.md`](evidence/FINAL_PROOF_MATRIX.md).

## Canonical deployment

- Registry: [`0x76DE9332010D5F03660Fa2216cb5cc76585dFFE8`](https://explorer-studio.genlayer.com/address/0x76DE9332010D5F03660Fa2216cb5cc76585dFFE8)
- Vault: [`0x536B5E36d52aC1EFA72d00fFa63B932EfBf42841`](https://explorer-studio.genlayer.com/address/0x536B5E36d52aC1EFA72d00fFa63B932EfBf42841)
- Registry deployment: [`0x67519eb9233c69b533b8cdfd66e61d7007429731b0faae05cedfd737d4bde536`](https://explorer-studio.genlayer.com/tx/0x67519eb9233c69b533b8cdfd66e61d7007429731b0faae05cedfd737d4bde536)
- Vault deployment: [`0xbf94fb658101a257ce8cee2f855e15100044436200492acb5f1b872d789be15b`](https://explorer-studio.genlayer.com/tx/0xbf94fb658101a257ce8cee2f855e15100044436200492acb5f1b872d789be15b)
- Wiring: [`0xe9c028be839b887bdf36e4572599d2cf98fd8b030fb2f45f79cd4795abbd819d`](https://explorer-studio.genlayer.com/tx/0xe9c028be839b887bdf36e4572599d2cf98fd8b030fb2f45f79cd4795abbd819d)
- Frontend: [the-vowmark.vercel.app](https://the-vowmark.vercel.app)

## Release state

- Frontend defaults target the canonical Registry and Vault.
- The issue flow waits for finalized execution, extracts the canonical returned commitment ID, waits for Vault registration, and verifies the full issuance terms before recording activity.
- Reviewer cooldown is isolated per reviewer, with an explicit bounded attempt cap.
- `get_issuance` exposes the full statement and verification rule for exact readback.
- The app logo remains present in the frontend.

## Verification

- Contract surface tests: `5 passed`
- Direct Mode custody tests: `4 passed`
- Simulator-backed Registry behavior tests: `4 passed`
- Frontend typecheck, lint, and production build: passed
- Final CI and production deployment records are added here after the release commit completes.

## Honest limitation

The real expiry proof is still pending the configured final review deadline. No expired outcome is claimed before that deadline. See the final proof matrix for the fulfilled, breached, inconclusive, anti-grief, and withdrawal evidence already recorded.
