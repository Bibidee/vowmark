# VOWMARK V1 handoff status

VOWMARK V1 is deployed on GenLayer Studionet and published at [the-vowmark.vercel.app](https://the-vowmark.vercel.app). The current contract pair is the only canonical deployment; earlier addresses are superseded.

## Canonical deployment

- Network: GenLayer Studionet
- Chain ID: `61999`
- RPC: [studio.genlayer.com/api](https://studio.genlayer.com/api)
- Explorer: [explorer-studio.genlayer.com](https://explorer-studio.genlayer.com)
- Frontend: [the-vowmark.vercel.app](https://the-vowmark.vercel.app)
- Production deployment: `dpl_ej7pBU3NwKKm8ePtpjbKVyhENYH8` (READY)
- GitHub source: [`3d86e5c`](https://github.com/Bibidee/vowmark/commit/3d86e5c)
- Source commit used for the public proof fixture: [`ce91210`](https://github.com/Bibidee/vowmark/commit/ce91210)

| Component | Address | Deployment transaction |
| --- | --- | --- |
| Registry | [0xbE235FC7CFb88dd5e0627b5916d8A916dF8680d5](https://explorer-studio.genlayer.com/address/0xbE235FC7CFb88dd5e0627b5916d8A916dF8680d5) | [0x787cdd067b313e8b0b91c88b9aa8ace9c7036a3cba3b9b13e5e3dedb69bace34](https://explorer-studio.genlayer.com/tx/0x787cdd067b313e8b0b91c88b9aa8ace9c7036a3cba3b9b13e5e3dedb69bace34) |
| Vault | [0x8AEBe9d98cDbB6460752d002C98D5E5745CA6533](https://explorer-studio.genlayer.com/address/0x8AEBe9d98cDbB6460752d002C98D5E5745CA6533) | [0x19c6ae6f9ad4659f5b6d42c859c885c85d578d39948efdb815ea8e93be09e04f](https://explorer-studio.genlayer.com/tx/0x19c6ae6f9ad4659f5b6d42c859c885c85d578d39948efdb815ea8e93be09e04f) |

Finalized wiring: [0x43c25bec13059da6839eb677e0af44aa2fcadd76856e5b7771a028eb65773ba3](https://explorer-studio.genlayer.com/tx/0x43c25bec13059da6839eb677e0af44aa2fcadd76856e5b7771a028eb65773ba3). Finalized readback confirms the Vault registry address and Registry configuration: minimum review window 7,200 seconds, maximum review window 7,776,000 seconds, retry cooldown 3,600 seconds, and bounded review history.

## Live proof matrix

The current fulfilled proof is [`evidence/live_fulfilled_pinned.json`](evidence/live_fulfilled_pinned.json). It records commitment `#6` with:

- `FULFILLED` verdict and terminal outcome;
- finalized Registry settlement reconciliation (`CREDIT_CONFIRMED`);
- `100000000000000` wei credited to the issuer exactly once;
- withdrawal transaction `0xc647b9e75ec528b4f8d3f0876a1d0ca64c8c373926e3f8d1415dc2512ccbbce4`, with credit changing from `100000000000000` to `0`.

The baseline breached and inconclusive records are summarized in [`evidence/live_lifecycle_baseline.md`](evidence/live_lifecycle_baseline.md). The breached record used commitment `#3`; the inconclusive record used commitment `#4`. No expired proof is claimed because expiry requires waiting for the configured review deadline.

## Verification status

- Source contract schema check: passed against the live schema service.
- Python surface tests: `5 passed, 1 skipped`.
- Direct Mode custody tests: `4 passed` in GitHub Actions; the Windows host still records four expected host xfails.
- Frontend typecheck: passed.
- Production build: confirmed by Vercel; `/`, `/issue`, `/activity`, `/commitment/6`, and the issuer history route returned HTTP 200.
- CI workflow: green in [GitHub Actions run 37673309246](https://github.com/Bibidee/vowmark/actions/runs/37673309246), covering Python, Direct Mode, typecheck, lint, and build checks.

The remaining practical limitation is that this host cannot execute GenLayer Direct Mode reliably on Windows because the SDK’s temporary stdin file is still open when the plugin tries to remove it. This is an execution-environment limitation, not a substitute for the Linux CI result.
