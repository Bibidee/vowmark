# Frontend dependency audit — 2026-10-08

The audit was run after `npm ci` from `web/` against the committed lockfile.

| Command | Result |
| --- | --- |
| `npm audit` | 5 high findings, all in the development lint chain: `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`. npm reports the available fix as a semver-major move to `eslint-config-next@14.2.35`, which is incompatible with the pinned Next 16 toolchain and was not applied blindly. |
| `npm audit --omit=dev` | 0 production findings; 0 informational, low, moderate, high or critical findings. |

The vulnerable packages are not included in the production dependency audit. The development-only findings remain disclosed rather than hidden by changing the supported Next/ESLint toolchain solely to produce a zero-count development report.
