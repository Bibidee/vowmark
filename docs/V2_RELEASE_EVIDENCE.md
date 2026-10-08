# VOWMARK V2 Release Evidence

This record is for the experimental `v2-hardening` branch only. It does not
change the submitted V1 release or authorize contract deployment.

## Git and Vercel

- V2 branch: `v2-hardening`
- V2 source SHA audited before this hardening pass: `c35836cd171035cbbbf9c13fd4cc403147c69433`
- GitHub Vercel status: `success` / “Deployment has completed”
- GitHub deployment ID: `6937842763`
- GitHub deployment environment: `Preview`
- environment: Preview
- V2 preview URL: [`https://vowmark-nooo07cxz-bibidees-projects.vercel.app`](https://vowmark-nooo07cxz-bibidees-projects.vercel.app)
- GitHub Vercel status target: [`https://vercel.com/bibidees-projects/vowmark/J3HvZzUZVDWTGsVqTTyj7CrZPJbc`](https://vercel.com/bibidees-projects/vowmark/J3HvZzUZVDWTGsVqTTyj7CrZPJbc)

V1 production remains unchanged. Vercel created a successful Preview
deployment/status for the `v2-hardening` branch, but no V2 deployment was
promoted to the canonical production alias. The canonical V1 alias remains
[`https://the-vowmark.vercel.app/`](https://the-vowmark.vercel.app/).

- Production promotion: not promoted.

## Contracts and configuration

- V1 Registry default: `0x3Be513bB6CAe652826A6092C0715AF39E7189c71`
- V1 Vault default: `0xf8D89f89aD160546780eD76Cd64C550d91bAf501`
- Network: GenLayer Studionet `61999` / `0xf22f`
- Contract deployment decision: **NO CONTRACT REDEPLOYMENT**
- Consensus decision: **KEEP STRICT_EQ**

The branch is therefore an experimental frontend/protocol-hardening line with
V1 contracts and V1 production still canonical.
