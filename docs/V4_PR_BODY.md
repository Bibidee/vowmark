## V4 security closure — corrected source, fresh deployment pending

This PR hardens VOWMARK's V4 Registry and Vault while preserving the 20-minute
minimum review window, normal 32/hour capacity, four-attempt final-window
reserve, and existing economic routing.

### Current deployment truth

- Authorized production **V1** remains at https://the-vowmark.vercel.app/ with
  its 15-minute minimum window and unchanged Registry/Vault.
- A historical V4 Studionet canary **was deployed**: Registry
  `0xE425f8c6E0780059b80cF34CB5e4A53e85a4Be26`, Vault
  `0x36D41a7BBf88b89A166AE71Dd8D045d3734a462C`; wiring finalized in
  [0xc2c4bfae…b36f4](https://explorer-studio.genlayer.com/tx/0xc2c4bfae0fdb7f0b8c86459a4a5c8bb9ad61f6970fe642a6383fa8a1f60b36f4).
  Its source is the pre-fix `9d4082c` snapshot retained through `5e6a917`.
- V4 branch Preview alias:
  https://vowmark-git-v4-security-remediation-bibidees-projects.vercel.app/
  Verified corrected-source snapshot on `869b70e`:
  https://vowmark-9t7jotj8w-bibidees-projects.vercel.app/
  (`dpl_7oj5inoBkucQVo35KAyQtSRTEdKf`).
  Main routes returned 200 and the bundle contained the historical V4 pair.
- The final numeric-host URL fix in this PR is **not deployed** at those
  addresses. A new pair and new live acceptance need explicit authorization.

### Security closure

- Both contract parsers now reject WHATWG numeric-final-label hostnames,
  including shortened hex, octal, decimal and IPv4-mapped IPv6 cases, while
  retaining valid HTTPS domain/IDNA/path/query/fragment behavior and `:443`
  canonicalization. Invalid issuance leaves no commitment or custody record.
- Source-kind trust remains conservative: no issuer-declared class is
  automatically authenticated; GitHub revisions are structural only.
- The historical canary finalized `FULFILLED`, `BREACHED`, `INCONCLUSIVE`, and
  real-deadline `EXPIRED_UNRESOLVED` cases. Withdrawal parent calls for #1
  and #4 finalized and emitted 0.0001 GEN external messages, but independent
  delivery was **not** observed. The full 0.0001 GEN remedy credit for #2
  remains and its withdrawal is `PENDING AUTHORIZED REMEDY-WALLET SIGNATURE`.
- DNS rebinding, redirect destinations and failed external-transfer recovery
  remain runtime limitations. No unsafe retry/refund was introduced.

Evidence: [live canary](https://github.com/Bibidee/vowmark/blob/v4-security-remediation/evidence/live_v4_smoke_2026-10-09.md),
[withdrawal audit](https://github.com/Bibidee/vowmark/blob/v4-security-remediation/evidence/live_v4_withdrawal_delivery_2026-10-09.md),
[security report](https://github.com/Bibidee/vowmark/blob/v4-security-remediation/docs/V4_SECURITY_REMEDIATION.md), and
[release checklist](https://github.com/Bibidee/vowmark/blob/v4-security-remediation/docs/V4_RELEASE_CHECKLIST.md).

### Release gate

The corrected source requires green exact-head CI and separate
fresh-deployment authorization. Do **not** merge, deploy, promote, change V1 production,
migrate balances, or sign a remedy-wallet withdrawal automatically.
