# VOWMARK Release Checklist

A release is not submission-ready unless all are true:

- [ ] product remains public-commitment accountability, not reference-repo dispute mechanics
- [ ] Studionet 61999 only
- [x] deployment CLI resolves to 0.39.2; contract schema checks pass
- [ ] no application backend
- [ ] injected wallet only
- [x] contract schemas/runtime compatible with the live toolchain
- [x] lifecycle authorization, immutable terms, prompt-injection defenses and payout invariants enforced
- [x] accepted vs finalized UI distinction and finalized-only reads implemented
- [x] provisional finality cannot be exploited for withdrawal
- [x] replay/duplicate review protection and cooldown-based recovery implemented
- [x] accounting invariant verified across multiple commitments
- [x] fulfilled lifecycle completed live
- [x] inconclusive recovery state and breached lifecycle completed live
- [x] withdrawal verified live
- [x] issuer history and recent board reads come from chain indexes
- [x] no fake demo state in production
- [x] canonical explorer links and source commit recorded
- [x] docs match actual deployed behavior
- [ ] originality audit passed
- [x] remaining limitations disclosed (Windows Direct Mode host limitation; expiry not artificially waited)
