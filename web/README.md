# VOWMARK web application

This is the Next.js App Router + TypeScript frontend for VOWMARK. It reads canonical public state directly from the Registry and finalized-only Vault on GenLayer Studionet and uses injected EIP-1193 wallets for writes.

Required public routes:

- `/`
- `/issue`
- `/commitment/[id]`
- `/issuer/[address]`
- `/activity`

Use injected EIP-1193 wallets only. The browser talks directly to GenLayer Studionet contracts. No application backend, API route, Server Action or authoritative localStorage state is present.

See `../docs/UX_DIRECTION.md` and `../BUILD_PROMPT.txt`.
