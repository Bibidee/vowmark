# VOWMARK V1 final proof matrix

This is the release matrix for the current Registry/Vault pair. Earlier deployment addresses and lifecycle artifacts are historical and superseded.

## Deployment

- Network: GenLayer Studionet, chain `61999`
- Registry: [`0x3Be513bB6CAe652826A6092C0715AF39E7189c71`](https://explorer-studio.genlayer.com/address/0x3Be513bB6CAe652826A6092C0715AF39E7189c71)
- Vault: [`0xf8D89f89aD160546780eD76Cd64C550d91bAf501`](https://explorer-studio.genlayer.com/address/0xf8D89f89aD160546780eD76Cd64C550d91bAf501)
- Registry deployment: [`0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1`](https://explorer-studio.genlayer.com/tx/0x9152e1d8560d7b3d0a8959ebf915973f832314bf21cf30397680def8447b1bd1)
- Vault deployment: [`0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938`](https://explorer-studio.genlayer.com/tx/0x3ed672661391d9fe4beab5577f8d27fc7649c99ff74f9909cd42a5d129420938)
- Finalized wiring: [`0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e`](https://explorer-studio.genlayer.com/tx/0xc05171edd4b81eb60ff6869e2df5f07b8bec3de504d704154caa9b3085a1fc6e)
- Unauthorized wiring rollback: [`0x19f2a8303e4b7e5ca29a493bb421ba35380f68d078c71e6ac137a2b8652f68f9`](https://explorer-studio.genlayer.com/tx/0x19f2a8303e4b7e5ca29a493bb421ba35380f68d078c71e6ac137a2b8652f68f9)
- Immutable-wiring negative test: [`0xb9440b627037f456d914a72a71174204aaefc3c8c292491773296e7bad389f10`](https://explorer-studio.genlayer.com/tx/0xb9440b627037f456d914a72a71174204aaefc3c8c292491773296e7bad389f10)
- Wiring readiness: internal `vault_ready=true` is set by the successful wiring tx and corroborated by fresh finalized registration; no public getter exists.
- Configuration readback: [`fresh_deployment_2026-10-08_pagination.md`](fresh_deployment_2026-10-08_pagination.md)
- Production frontend: [`the-vowmark.vercel.app`](https://the-vowmark.vercel.app/) points to Vercel deployment [`dpl_E7BqsrfqrsiPEEwEGnGS2iqQBXsd`](https://vercel.com/bibidees-projects/vowmark/E7BqsrfqrsiPEEwEGnGS2iqQBXsd), `READY`/`production`, built from application SHA `8dbb131958d28f87d9f618a9d2bbd09744a6986b`.

## Live proof matrix

| Case | Current result | Evidence status |
| --- | --- | --- |
| Fulfilled | `#0` `FULFILLED` | [`live_fulfilled_final.json`](live_fulfilled_final.json), create `0xaf1e83b497a5b8fa9948695ab564aec18ee8dd0179988e20b5a7b19e4b97c952`, review `0xa8d69825b070739c78e51809091787fdafad19f3ca25fffc0afab12986294bdb`, reconcile `0x66c7830113f9154a5f7d9048fed61f4b82328897efea5d4e8bf8f7f598af5175` |
| Breached | `#1` `BREACHED` | [`live_breached_final.json`](live_breached_final.json), create `0x84585f926442493a8502a9b90aa446b16832680d7a823315e4fd3910b59829f7`, review `0x782e6be5496e0ef3505770bc9cb90666b339ff511c5e819d23660b6048d59047`, reconcile `0x677bd4fcd69d40bdafd8a95b1c259046efffee74f35719221890d6ab1b99358d` |
| Inconclusive | `#2` `INCONCLUSIVE`, remains `OPEN` | [`live_inconclusive_final.json`](live_inconclusive_final.json), create `0xcfb7eb2245ea6cd911cdf222f698b13b4019e2b0adeb40cfac188f3064d3d198`, review `0x9fc6422b9fe73c04c13895edbf1ae53feb2f29efe70ecf1809ec6fc172725f93`, settlement remains locked |
| Withdrawal | Fulfilled credit `100000000000000 → 0` | [`live_fulfilled_final.json`](live_fulfilled_final.json), `0x9205d8f7d0e073df3d66c4df48c146aa9c1ce14ce20975d6aa29898c0679b20c` |
| Review history | Count plus bounded pages; max page size `25`, newest-first | Contract surface, simulator pagination test and frontend load-older flow |
| Withdrawal failure boundary | Direct EOA only; sender must equal origin; debit-before-send | Vault source, Direct Mode tests and `get_withdrawal_policy()` readback |
| Settlement recovery | Finalized Registry settlement, Vault credit readback and explicit reconcile path | Fresh fulfilled/breached artifacts; simulator idempotence and retry coverage |
| Review liveness | Automated simulator proof | Per-reviewer cooldown and hourly epoch capacity; no lifetime cap; live retry was not claimed because the public source snapshot remained identical |
| Registration recovery | Automated/simulator-limited | Retry idempotence and immutable replay covered; missing-child suppression is unavailable in the simulator |
| Expired | `#6` `EXPIRED_UNRESOLVED` | [`live_expiry_candidate_final.json`](live_expiry_candidate_final.json) contains create `0x93f4f940031a1448d923625867307117acf21a686d338fbd8a68ef627ea93ae5` and review `0x6ccca90e7ce4b5a93022ab8fd9474a4e7b9213beb3139024bebb7cb35dcc9dc6`; [`live_expired_final.json`](live_expired_final.json) contains expire `0xf9fdd32e4d008a896529d3bb162fa3b0624bea9656eed74f74d95191e3d3bf5a`, reconcile `0xa3b75ded72208b8e87b76c06c8ac1915b35f49d8521ced386168e53e0a5c246f`, withdrawal `0x213b7b472b870a489a1ebcf7b18f5476b5c52b16a7159af75f8032df5bd970ca`, and credit `100000000000000 → 0` |

Earlier lifecycle and withdrawal artifacts were produced against superseded addresses and must not be used as evidence for this release.

## Verification status

- Contract surface tests: `20 passed`
- Direct Mode custody tests: `4 passed` locally with `.venv-direct`; Linux CI remains authoritative
- Simulator-backed Registry behavior tests: `11 passed`
- Frontend typecheck, lint, board invariant test, and production build: passed
- Final CI: [`37777191132`](https://github.com/Bibidee/vowmark/actions/runs/37777191132), all four jobs green for application SHA `8dbb131958d28f87d9f618a9d2bbd09744a6986b`
- Production routes `/`, `/issue`, `/activity`, `/commitment/0`, and `/issuer/0x794678AD7e8B6c87dAb33303a3A512c821e6De9A`: HTTP `200`

## Expiry

`EXPIRED_UNRESOLVED` is proven live on the final pair after the real 15-minute deadline, with finalized settlement, issuer credit and direct-EOA withdrawal readback.

## Release provenance

`8dbb131958d28f87d9f618a9d2bbd09744a6986b` → [CI run 37777191132](https://github.com/Bibidee/vowmark/actions/runs/37777191132) → [Vercel deployment dpl_E7BqsrfqrsiPEEwEGnGS2iqQBXsd](https://vercel.com/bibidees-projects/vowmark/E7BqsrfqrsiPEEwEGnGS2iqQBXsd) → final Registry → final Vault. The requested alias [`the-vowmark.vercel.app`](https://the-vowmark.vercel.app/) resolves to that deployment.
