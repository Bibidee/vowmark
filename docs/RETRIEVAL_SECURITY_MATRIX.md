# VOWMARK Retrieval Security Matrix

This is a bounded source audit. It does not claim complete SSRF prevention and
does not perform risky runtime/network exploitation against production.

| Case | Classification | Current observation |
| --- | --- | --- |
| `localhost` | `VOWMARK-REJECTED` | Explicit host rejection |
| Literal loopback `127.x.x.x` | `VOWMARK-REJECTED` | Blocked prefix |
| Private IPv4 `10/8`, `192.168/16` | `VOWMARK-REJECTED` | Blocked prefixes |
| `172.16/12` | `VOWMARK-REJECTED` | Second-octet range check |
| Link-local `169.254/16` | `VOWMARK-REJECTED` | Blocked prefix |
| `0.0.0.0` and `0.x` | `VOWMARK-REJECTED` | Explicit/blocked prefix |
| Credential-bearing URL | `VOWMARK-REJECTED` | `@` is forbidden |
| Backslash or NUL | `VOWMARK-REJECTED` | Forbidden characters |
| Malformed/empty authority | `VOWMARK-REJECTED` | Authority and dot checks |
| Hostname without a dot | `VOWMARK-REJECTED` | Public-hostname check |
| Bracketed IPv6 loopback/private form | `VOWMARK-REJECTED` by current parser | The simple host split rejects bracketed IPv6 forms; this is not a complete IPv6 policy |
| Dotted-octal/alternate numeric IP | `VOWMARK-ACCEPTED / RUNTIME-DEPENDENT` | Not all numeric spellings are canonicalized by VOWMARK |
| DNS alias to private IP | `VOWMARK-ACCEPTED / RUNTIME-DEPENDENT` | DNS is not resolved or pinned by the contract |
| Public → private redirect | `UNVERIFIED` | Final redirect target is not inspected by VOWMARK |
| Redirect chain | `UNVERIFIED` | Redirect count/policy is runtime-owned |
| DNS rebinding | `UNVERIFIED` | No resolver pinning is implemented by VOWMARK |
| Unusual port | `VOWMARK-ACCEPTED / RUNTIME-DEPENDENT` | Contract parser accepts authority ports; GenVM policy decides availability |
| Percent/encoding edge cases | `UNVERIFIED` | Contract normalization is not a full URL parser |
| Oversized response | `VOWMARK-REJECTED` after render | Returned text over 12,000 characters becomes `INCONCLUSIVE`; pre-render resource limits are runtime-owned |

GenVM runtime URL policy remains a separate dependency. No claim is made that
all SSRF paths are prevented by the application contract.
