# VOWMARK V2 Release Evidence

This record is for the experimental `v2-hardening` branch only. It does not
change the submitted V1 release, authorize contract deployment, or promote a
V2 deployment to production.

## V1 FROZEN RELEASE

- Frozen V1/main commit: `97b5ca8888eeaca3d2b1deb733c832c8448d4383`
- Canonical V1 production: [`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/)
- V1 Registry: `0x3Be513bB6CAe652826A6092C0715AF39E7189c71`
- V1 Vault: `0xf8D89f89aD160546780eD76Cd64C550d91bAf501`
- Network: GenLayer Studionet `61999` / `0xf22f`

These V1 values remain the canonical deployment and frontend configuration.

## V2 APPLICATION

- Branch: `v2-hardening`
- V2 application SHA: `5946c56d192e27cfa24354ab7fdecd6186e24f49`
- Application CI run: [`37796667038`](https://github.com/Bibidee/vowmark/actions/runs/37796667038)

The V2 application SHA is the frozen application/runtime state. Later commits
in this branch are evidence-only and must not redefine the application SHA.

## V2 EVIDENCE HEAD

The V2 evidence head is the current Git `HEAD` after the focused
documentation/provenance cleanup commit. It is derived from the containing Git
commit at runtime by `scripts/check_release_consistency.py`; a literal
self-reference is intentionally not duplicated in this file because changing
the recorded hash would create another evidence head. The final handoff
reports the exact evidence-head commit and its GitHub Actions run.

The release-consistency gate verifies that the V2 application SHA exists in
history, is an ancestor of the evidence head, and that all paths changed after
the application SHA are limited to documentation, benchmark results, the
consistency checker, or the hardening workflow. Application/runtime paths fail
the gate.

## VERCEL PREVIEW FOR THE V2 APPLICATION

The following successful Preview is attached to the frozen V2 application SHA,
not to a later documentation-only evidence commit:

- GitHub Vercel status: `success` / “Deployment has completed”
- Deployment ID: `6938937085`
- environment: Preview
- production_environment: false
- Preview URL: [`https://vowmark-mqrgpahxb-bibidees-projects.vercel.app`](https://vowmark-mqrgpahxb-bibidees-projects.vercel.app)
- Vercel status target: [`https://vercel.com/bibidees-projects/vowmark/AQzJEvbhLARyjSZTqyQvXwox3mbe`](https://vercel.com/bibidees-projects/vowmark/AQzJEvbhLARyjSZTqyQvXwox3mbe)
- Deployment status endpoint: [`https://api.github.com/repos/Bibidee/vowmark/deployments/6938937085/statuses/19467477516`](https://api.github.com/repos/Bibidee/vowmark/deployments/6938937085/statuses/19467477516)

This successful Vercel Preview was not promoted to the canonical production
alias. A later docs-only commit may receive its own Preview, but that does not
replace the Preview evidence attached to the frozen application SHA.

## CONTRACTS AND CONFIGURATION

- Contract deployment decision: **NO CONTRACT REDEPLOYMENT**
- Production alias: [`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/)
- Consensus decision: **KEEP STRICT_EQ**
- Benchmark definition freeze: `cefd2808340086beb8810f5bff63dd7ad8ee4865`

No Studionet contract addresses were changed or redeployed for V2. The branch
remains an experimental hardening line with V1 contracts and V1 production
still canonical.
