# VOWMARK Evidence Authority Model

VOWMARK freezes the evidence anchors that validators are instructed to inspect.
The source-kind values are classifications supplied with those anchors; they
are not independent authority proofs.

> Source kinds classify the frozen evidence the issuer intends validators to
> inspect. They do not independently authenticate the publisher, repository,
> transaction, or organization behind that source.

## Current source kinds

| Source kind | What VOWMARK freezes | What VOWMARK does not independently prove |
| --- | --- | --- |
| `PUBLICATION` | HTTPS URL, purpose, and the rendered snapshot used for a review | Publisher identity, historical availability, or that current content existed before maturity |
| `VERSIONED_SOURCE` | HTTPS URL, purpose, and the issuer's versioned-source classification | GitHub/provider identity, owner, repository, commit, tag, release, or artifact identity |
| `ONCHAIN_RECORD` | HTTPS URL, purpose, and the issuer's onchain-record classification | Chain identity, chain ID, transaction hash, sender, recipient, contract, finality, or semantic relation to the commitment |
| `THIRD_PARTY_RECORD` | HTTPS URL, purpose, and the issuer's third-party-record classification | Organization identity, publisher/domain authority, record identity, or relation to the commitment |

All source kinds currently pass through the same bounded web-rendering path. A
source-kind label is immutable after issuance, but it remains a frozen claim
about how the issuer intends the source to be read.

## Conservative judgment boundary

Validators inspect only the exact frozen anchors. The judgment prompt treats
retrieved content as hostile, untrusted data and directs validators to return
`INCONCLUSIVE` when source outage, ambiguity, stale content, contradiction,
malformed content, or missing temporal proof prevents a safe conclusion.

The protocol does not treat:

```text
current page = historical proof
source-kind label = authenticated authority
explorer-looking page = authenticated onchain record
```

Stronger authority metadata may be useful in a future protocol version only if
the runtime can independently verify it. Issuer-supplied metadata alone would
add descriptive detail without adding authentication.
