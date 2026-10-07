# VOWMARK V1 Handoff Status

VOWMARK V1 is deployed on GenLayer Studionet and the frontend is live.

## Canonical deployment

- Network: GenLayer Studionet
- Chain ID: `61999`
- RPC: [studio.genlayer.com/api](https://studio.genlayer.com/api)
- Explorer: [explorer-studio.genlayer.com](https://explorer-studio.genlayer.com)
- Production frontend: [vowmark.ojikutusarat.chatgpt.site](https://vowmark.ojikutusarat.chatgpt.site)

| Component | Address | Deployment transaction |
| --- | --- | --- |
| Registry | [0x2590706b18a1385A23842bdEAe793EE4374a3bE4](https://explorer-studio.genlayer.com/address/0x2590706b18a1385A23842bdEAe793EE4374a3bE4) | [0x423658b2c4462e1f19fad5d2e73dc15d8a0d5fff2d74cd41c7e817b1cb027170](https://explorer-studio.genlayer.com/tx/0x423658b2c4462e1f19fad5d2e73dc15d8a0d5fff2d74cd41c7e817b1cb027170) |
| Vault | [0x921Ed9F83A89ED9aADD5A02fbDc818D1c244cE7e](https://explorer-studio.genlayer.com/address/0x921Ed9F83A89ED9aADD5A02fbDc818D1c244cE7e) | [0xc903acbb95e353a6960d7327bca6c2bc172cfe0403090516b39ae50f4e33e8ce](https://explorer-studio.genlayer.com/tx/0xc903acbb95e353a6960d7327bca6c2bc172cfe0403090516b39ae50f4e33e8ce) |

The finalized one-time Registry → Vault wiring transaction is [0x726549336d18f384b769dc7c7418e164a2b3938b362b5dcf1bf988917457349a](https://explorer-studio.genlayer.com/tx/0x726549336d18f384b769dc7c7418e164a2b3938b362b5dcf1bf988917457349a). Canonical readback confirms that each contract points to the other, and the Registry reports chain 61999 with eight maximum review attempts and a one-hour retry cooldown.

## Live lifecycle proofs

All proof transactions below use the canonical Registry/Vault pair and a 0.0001 GEN bond.

| Commitment | Observed result | Create | Review |
| --- | --- | --- | --- |
| #0 | Open after `MAJORITY_DISAGREE`; no outcome claimed | [create](https://explorer-studio.genlayer.com/tx/0x5b0f5d79be97cb42122800bf0251985868d11facedfa1d6ecea5af49e418e143) | [review](https://explorer-studio.genlayer.com/tx/0x79444b83b729672b30689f103256dfd3a644be1af1ce16042bd38f3634eb5560) |
| #1 | `BREACHED`; 0.0001 GEN credited to the remedy address | [create](https://explorer-studio.genlayer.com/tx/0x89f1f3572b62f84feccddce62e62381fca4cd9e62efb9735ceea85ff32c0a08c) | [review](https://explorer-studio.genlayer.com/tx/0x7d7dd2791e97e2e1a97cab0076d7241b12cb5f8aec5108d1c35627615022c496) |
| #2 | `INCONCLUSIVE`; remains open and retryable | [create](https://explorer-studio.genlayer.com/tx/0xaa4c82b552eab1f865810423871f0c8a72608bee01d95b3ac961a9de84efdab0) | [review](https://explorer-studio.genlayer.com/tx/0x09b917af2a9fcfe704033c1e5dd6d4017d9c4d816d9628f1200cf244f25e7660) |
| #3 | `INCONCLUSIVE`; RFC evidence attempt remains open | [create](https://explorer-studio.genlayer.com/tx/0xc39ce03e4557274d69787282eb2fe185eff00ff180ec56de032fec8c6f18eb32) | [review](https://explorer-studio.genlayer.com/tx/0x6e6b0a1ef481be979a804ba2326e34ea9f2ce6c7b404fd3a2504c316f6aad7a2) |
| #4 | `INCONCLUSIVE`; alternate RFC evidence attempt remains open | [create](https://explorer-studio.genlayer.com/tx/0xa9309d786fe32070a58a919b42f2691a75b28ffd6d794f8fe6da114b79024535) | [review](https://explorer-studio.genlayer.com/tx/0x7ee6266842a88e445f7480e97ef9e79790ba8700e16645321f051bdda3667a89) |
| #5 | `BREACHED`; used for the withdrawal proof below | [create](https://explorer-studio.genlayer.com/tx/0x03a5c7a047cfe08c8485ad597cc4cc567e2d7f94fcbc933f086672a76943b74f) | [review](https://explorer-studio.genlayer.com/tx/0xc3ca6078e8e772e9af04f1a249ff6bcb128c33572657177939148424ac7ef95d) |
| #6 | `INCONCLUSIVE`; compact dated GitHub commit evidence still did not reach validator consensus | [create](https://explorer-studio.genlayer.com/tx/0xf26413b14d55a7c8e94f33dad4638820ec1d87a0b920cbfa153ff1479e861243) | [review](https://explorer-studio.genlayer.com/tx/0x0e2fd01c4436636d9c54a892cb745a85efcb16b9807f9cf421a314d6150971b4) |

No `FULFILLED` proof is claimed: the positive-evidence attempts, including the compact dated GitHub commit record in #6, did not reach a conclusive fulfilled result. No `EXPIRED_UNRESOLVED` proof is claimed: expiry requires the contract’s final review deadline to elapse, and no artificial wait or state shortcut was used.

## Withdrawal proof

For commitment #5, the remedy account was [0x7eb2a4b4e913df62eae807ef60509b3b7284c7fa](https://explorer-studio.genlayer.com/address/0x7eb2a4b4e913df62eae807ef60509b3b7284c7fa).

- Credit before withdrawal: 0.0001 GEN
- Withdrawal transaction: [0xdb6c7c2b66e6ee03d167a6a3a4fa96941a167db42798992e566aa8258904161b](https://explorer-studio.genlayer.com/tx/0xdb6c7c2b66e6ee03d167a6a3a4fa96941a167db42798992e566aa8258904161b)
- Credit after withdrawal: 0 GEN

## Verification completed

- Frontend: `npm run typecheck`, `npm run lint`, and static production build pass.
- Contract tests: `4 passed, 1 skipped`.
- Python contract compilation passes.
- Both canonical deployment receipts finalized successfully and code readback was verified.
- The local fast contract lint passes. The pinned Windows semantic SDK validation remains unavailable because its local SDK artifact cannot be loaded; this does not affect the finalized on-chain deployments.

Older failed or superseded deployment attempts are intentionally not presented as canonical evidence.

