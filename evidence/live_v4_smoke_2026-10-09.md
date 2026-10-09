# VOWMARK V4 live Studionet canary

Generated: 2026-10-09

This is V4 evidence for the controlled `v4-security-remediation` canary. It
does not replace the V1 production evidence in `HANDOFF_STATUS.md`.

## Deployment and wiring

- Network: GenLayer Studionet, chain `61999`
- Deployment account: `0x794678AD7e8B6c87dAb33303a3A512c821e6De9A`
- Registry: [`0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26`](https://explorer-studio.genlayer.com/address/0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26)
- Vault: [`0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C`](https://explorer-studio.genlayer.com/address/0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C)
- Registry deployment: [`0xa89729b327ce510e46f0183dc95c2f7d57ba0073ae3c6f4f720010b048b3564f`](https://explorer-studio.genlayer.com/tx/0xa89729b327ce510e46f0183dc95c2f7d57ba0073ae3c6f4f720010b048b3564f)
- Vault deployment: [`0x87f195ae06bb4eb66deff61bdc5012f35d15c9dbacf0b943806a55183d5ed9ed`](https://explorer-studio.genlayer.com/tx/0x87f195ae06bb4eb66deff61bdc5012f35d15c9dbacf0b943806a55183d5ed9ed)
- Finalized Registry wiring: [`0xc2c4bfae0fdb7f0b8c86459a4a5c8bb9ad61f6970fe642a6383fa8a1f60b36f4`](https://explorer-studio.genlayer.com/tx/0xc2c4bfae0fdb7f0b8c86459a4a5c8bb9ad61f6970fe642a6383fa8a1f60b36f4)
- Registry constructor Vault placeholder: zero address, then one-time deployer wiring
- Vault constructor Registry: `0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26`
- Finalized readback: `min_review_window=1200`, `retry_cooldown=300`,
  `review_cooldown_scope=per_reviewer`, `review_epoch_seconds=3600`,
  `max_review_attempts_per_epoch=32`, `max_review_window=7776000`, and both
  Registry/Vault pointers match.

## V4 Preview wiring

- Preview URL: [`https://vowmark-80l3g9uke-bibidees-projects.vercel.app/`](https://vowmark-80l3g9uke-bibidees-projects.vercel.app/)
- Deployment: [`dpl_GqGeLapmJv5mMtEcfURGfcrUVNCr`](https://vercel.com/bibidees-projects/vowmark/GqGeLapmJv5mMtEcfURGfcrUVNCr)
- Build state: `READY`
- Configuration scope: Preview branch `v4-security-remediation` only
- Bundle verification: the deployed client bundle contains both fresh V4
  contract addresses; the Preview route returned HTTP `200`.
- Production remains V1 at [`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/).

## Live lifecycle results

Each test bond was `100000000000000` wei (`0.0001 GEN`).

| Commitment | Control | Result | Finalized transactions | Settlement / withdrawal |
| ---: | --- | --- | --- | --- |
| `#1` | Versioned GitHub proof | `FULFILLED` | [create](https://explorer-studio.genlayer.com/tx/0x37480a24661f89ad531849b4642a5843ce7a31972ad614142d87a9cc1e15e40f), [review](https://explorer-studio.genlayer.com/tx/0x495b7604f878a9176554815bf2b1c0798a65dc4c53ed7423c034e5e7b6b7b0a7), [reconcile](https://explorer-studio.genlayer.com/tx/0xd34a3a9d7a07283341c56ef0ad4faa0d6a5e308c1391cb9d91c2235711ce0c4a) | Vault credit confirmed; [withdrawal](https://explorer-studio.genlayer.com/tx/0xfddd58d24964d7d920533d3b223d6550265fa524565a271f1919cdea38df9d7d) reduced credit from `0.0002` to `0.0001 GEN`. |
| `#2` | Negative publication control | `BREACHED` | [create](https://explorer-studio.genlayer.com/tx/0xbfb16d50acdbd7f8f5c1dd822fc73a25293d23f8028fa3d010da7772eb7461bd), [review](https://explorer-studio.genlayer.com/tx/0xec86b50cb9d990f9db7f8bd3f5d191a3600caaf1869a5469b08d900581edaf6a), [reconcile](https://explorer-studio.genlayer.com/tx/0x0ae98e4d8dd68261a63ffda6bebb97dc1d2b0f290d9ab152b78dcc2fc345597e) | Vault credit confirmed to remedy `0xFf203Bb65942F50CB81A8AF98c5F5bd9d8a79b54`. |
| `#3` | Valid public 404 / no time-bearing proof | `INCONCLUSIVE`, remains `OPEN` | [create](https://explorer-studio.genlayer.com/tx/0x515f7af854ce15eafd5ad8e12d026dd66dfe06e6d4f980a415e43356c554f4e5), [review](https://explorer-studio.genlayer.com/tx/0x6311f2d23d8d3037781de6dd17efa9f9ec847e25e4c9186f7b5fa5f8974ceb90) | Settlement remains `LOCKED`; no issuer or remedy credit. |
| `#4` | Valid public 404 / final-window expiry | `EXPIRED_UNRESOLVED` | [create](https://explorer-studio.genlayer.com/tx/0xf7b9d6c9edaf55b41422dd17440f8508ec3872394df019296262c8efb4356a5c), [review](https://explorer-studio.genlayer.com/tx/0x26f11c5cff60ce02f9b3733fd36fd8d7d3d6a1377d978887ec265a2136ce4691), [expire](https://explorer-studio.genlayer.com/tx/0x0d8b0b14bfdec32f58a4b26b43a2ab3388e94af1f8479cb596a9140ac8ba693e), [reconcile](https://explorer-studio.genlayer.com/tx/0xc2d216396e94378a121fb4d29b214efb4bfe4875788bf580782c1621eba81204) | Deadline passed on-chain; credit confirmed to issuer; [withdrawal](https://explorer-studio.genlayer.com/tx/0x58c1e1f90e039790047e236459d826a093e038b4a7b04c1db6cf1fc90de69eb0) reduced credit from `0.0002` to `0.0001 GEN`. |

The first attempted inconclusive fixture used a reserved `.invalid` hostname.
V4 correctly finalized that issuance as an execution error with no commitment
created and no credit change. The live control was then rerun with the valid
public 404 anchor above and produced `INCONCLUSIVE` as intended.

## Conclusion

The fresh V4 pair, Preview wiring, fulfilled/breached/inconclusive outcomes,
real-deadline expiry, finalized settlement reconciliation, and withdrawal
readbacks are proven on Studionet. No production promotion was performed.
