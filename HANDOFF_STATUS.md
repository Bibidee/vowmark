# VOWMARK V1 handoff status

VOWMARK V1 is deployed on GenLayer Studionet 61999 and published at [the-vowmark.vercel.app](https://the-vowmark.vercel.app). The canonical deployment and evidence are documented in [`evidence/FINAL_PROOF_MATRIX.md`](evidence/FINAL_PROOF_MATRIX.md).

## Canonical deployment

- Registry: [`0x76DE9332010D5F03660Fa2216cb5cc76585dFFE8`](https://explorer-studio.genlayer.com/address/0x76DE9332010D5F03660Fa2216cb5cc76585dFFE8)
- Vault: [`0x536B5E36d52aC1EFA72d00fFa63B932EfBf42841`](https://explorer-studio.genlayer.com/address/0x536B5E36d52aC1EFA72d00fFa63B932EfBf42841)
- Registry deployment: [`0x67519eb9233c69b533b8cdfd66e61d7007429731b0faae05cedfd737d4bde536`](https://explorer-studio.genlayer.com/tx/0x67519eb9233c69b533b8cdfd66e61d7007429731b0faae05cedfd737d4bde536)
- Vault deployment: [`0xbf94fb658101a257ce8cee2f855e15100044436200492acb5f1b872d789be15b`](https://explorer-studio.genlayer.com/tx/0xbf94fb658101a257ce8cee2f855e15100044436200492acb5f1b872d789be15b)
- Wiring: [`0xe9c028be839b887bdf36e4572599d2cf98fd8b030fb2f45f79cd4795abbd819d`](https://explorer-studio.genlayer.com/tx/0xe9c028be839b887bdf36e4572599d2cf98fd8b030fb2f45f79cd4795abbd819d)
- Frontend: [the-vowmark.vercel.app](https://the-vowmark.vercel.app)
- Verified application commit: `f79a61097d35af4ac534f20081f913e26c45e3df`
- Production deployment: `dpl_FS37jgW9J6d5p3LxhWT7pDo1zq7H` (READY)

## Release state

- Frontend defaults target the canonical Registry and Vault.
- The transaction rail uses explicit `IDLE`, `SUBMITTED`, `ACCEPTED`, `FINALIZED`, and `ERROR` stages; human-readable detail cannot activate finality.
- The issue flow persists its hash immediately, extracts the canonical returned commitment ID only after successful finality, verifies all Vault issuance terms, and exposes recoverable Registry registration retry from Issue and Activity.
- Public reads use the configured Studionet RPC and normalize GenLayer map readbacks before rendering; wallet injection remains write-only.
- Reviewer cooldown is isolated per reviewer, with an explicit bounded attempt cap.
- `get_issuance` exposes the full statement and verification rule for exact readback.
- The app logo remains present in the frontend.

## Verification

- Contract surface tests: `5 passed`
- Direct Mode custody tests: `4 passed`
- Simulator-backed Registry behavior tests: `5 passed`
- Frontend typecheck, lint, and production build: passed
- Final CI: [GitHub Actions run 37736857905](https://github.com/Bibidee/vowmark/actions/runs/37736857905), `python-surface`, `web`, `direct-mode`, and `simulator-registry` all passed
- Production deployment: [Vercel deployment](https://vercel.com/bibidees-projects/vowmark/FS37jgW9J6d5p3LxhWT7pDo1zq7H), READY
- Production route checks: `/`, `/issue`, `/activity`, `/commitment/0`, `/commitment/1`, `/commitment/5`, and `/issuer/0x794678ad7e8b6c87dab33303a3a512c821e6de9a`

## Honest limitation

The real expiry proof is still pending the configured final review deadline. No expired outcome is claimed before that deadline. The simulator cannot suppress the first finalized child message, so the registration test proves immutable, duplicate-safe retry replay after automatic delivery rather than a missing-child injection. See the final proof matrix for the fulfilled, breached, inconclusive, anti-grief, and withdrawal evidence already recorded.
