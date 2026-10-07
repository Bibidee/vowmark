# VOWMARK V1 final proof matrix

This is the canonical evidence set for the final Studionet deployment. Earlier deployment addresses and earlier lifecycle artifacts are superseded.

## Deployment

- Network: GenLayer Studionet, chain `61999`
- Registry: [`0x76DE9332010D5F03660Fa2216cb5cc76585dFFE8`](https://explorer-studio.genlayer.com/address/0x76DE9332010D5F03660Fa2216cb5cc76585dFFE8)
- Vault: [`0x536B5E36d52aC1EFA72d00fFa63B932EfBf42841`](https://explorer-studio.genlayer.com/address/0x536B5E36d52aC1EFA72d00fFa63B932EfBf42841)
- Registry deployment: [`0x67519eb9233c69b533b8cdfd66e61d7007429731b0faae05cedfd737d4bde536`](https://explorer-studio.genlayer.com/tx/0x67519eb9233c69b533b8cdfd66e61d7007429731b0faae05cedfd737d4bde536)
- Vault deployment: [`0xbf94fb658101a257ce8cee2f855e15100044436200492acb5f1b872d789be15b`](https://explorer-studio.genlayer.com/tx/0xbf94fb658101a257ce8cee2f855e15100044436200492acb5f1b872d789be15b)
- Wiring: [`0xe9c028be839b887bdf36e4572599d2cf98fd8b030fb2f45f79cd4795abbd819d`](https://explorer-studio.genlayer.com/tx/0xe9c028be839b887bdf36e4572599d2cf98fd8b030fb2f45f79cd4795abbd819d)
- Production frontend: [the-vowmark.vercel.app](https://the-vowmark.vercel.app)
- Production deployment: [`dpl_6kcbvCcgvFoabB6CKUdYpWXRL71V`](https://vercel.com/bibidees-projects/vowmark/6kcbvCcgvFoabB6CKUdYpWXRL71V), READY

The finalized configuration readback is: minimum review window `7200` seconds, maximum review window `7776000` seconds, retry cooldown `3600` seconds, bounded attempts `2161`, and cooldown scope `per_reviewer`.

## Live outcomes

| Case | Commitment | Result | Evidence |
| --- | ---: | --- | --- |
| Fulfilled | `#0` | `FULFILLED`, settled to issuer, withdrawn | [`live_fulfilled_final.json`](live_fulfilled_final.json) |
| Breached | `#1` | `BREACHED`, settled to remedy address | [`live_breached_final.json`](live_breached_final.json) |
| Inconclusive | `#2` | `INCONCLUSIVE`, remains open with no settlement | [`live_inconclusive_final.json`](live_inconclusive_final.json) |
| Anti-grief | `#5` | Two distinct reviewers, two changed snapshots, `attempt_count = 2`, remains open | [`live_antigrief_final.json`](live_antigrief_final.json) |
| Expired | `#3` | Pending the real final review deadline; no expiry is claimed yet | `live_expired_pinned.json` will be written only after the deadline passes |

### Fulfilled and withdrawal

- Create: [`0x69da54699dae047485ed907312eabf85e4ee8beae2bd451f715f55fa9574bbad`](https://explorer-studio.genlayer.com/tx/0x69da54699dae047485ed907312eabf85e4ee8beae2bd451f715f55fa9574bbad)
- Review: [`0x29dd02d53c6cab9d816d6f6bb4f0576ed52912548e4b3c76957b576d0ebf2c0e`](https://explorer-studio.genlayer.com/tx/0x29dd02d53c6cab9d816d6f6bb4f0576ed52912548e4b3c76957b576d0ebf2c0e)
- Reconcile: [`0x7b7a49e3944211f6a3a375241528c118c73d9059b973351fd82a81cde1fa7605`](https://explorer-studio.genlayer.com/tx/0x7b7a49e3944211f6a3a375241528c118c73d9059b973351fd82a81cde1fa7605)
- Withdrawal: [`0x1c5eb3c86fda144801990ab55aa4d21f0464468fe5e4aae570a2b9d8258864da`](https://explorer-studio.genlayer.com/tx/0x1c5eb3c86fda144801990ab55aa4d21f0464468fe5e4aae570a2b9d8258864da), credit `100000000000000 → 0`

### Anti-grief

Commitment `#5` used two unlocked accounts: reviewer A `0x7eB2a4B4e913Df62eAe807eF60509B3B7284C7FA` and reviewer B `0xf883bCE8FcB120F714B147446342D7E4545Bc988`. The public fixture changed from commit `d1d52ad` to `eeeb32d` between the two finalized reviews. The recorded snapshot digests differ, and both reviews were accepted without waiting for the one-hour cooldown because the cooldown is scoped per reviewer.

- Create: [`0x881eb2dbb99a6a656b23b46c0e025088a97a638291e4f50cf32f37b476e2cce7`](https://explorer-studio.genlayer.com/tx/0x881eb2dbb99a6a656b23b46c0e025088a97a638291e4f50cf32f37b476e2cce7)
- Reviewer A: [`0x2c786fe9d6c9e92c10143ca8806ff63a5c092b73adb73ad47b7cb36baf8c8fcf`](https://explorer-studio.genlayer.com/tx/0x2c786fe9d6c9e92c10143ca8806ff63a5c092b73adb73ad47b7cb36baf8c8fcf)
- Reviewer B: [`0xc7f311f99b313e9639bb8299121acd6668929b72b651550351f38f82cf416711`](https://explorer-studio.genlayer.com/tx/0xc7f311f99b313e9639bb8299121acd6668929b72b651550351f38f82cf416711)

## Verification

- Contract surface tests: `5 passed`
- Direct Mode tests: `4 passed`
- Simulator-backed Registry behavior tests: `4 passed`
- Frontend typecheck, lint, and production build: passed
- Final CI: [GitHub Actions run 37700496711](https://github.com/Bibidee/vowmark/actions/runs/37700496711), all four jobs passed
- App logo: retained in the application; no logo removal was made

## Current limitation

The expired proof is intentionally not claimed until commitment `#3` passes its actual configured deadline. The expiry runner is active and will write the artifact only after the finalized expiry, settlement reconciliation, and withdrawal are observed.
