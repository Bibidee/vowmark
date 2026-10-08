# VOWMARK V2 Judgment Calibration Benchmark Results

The benchmark definition was frozen in commit `cefd280` before any result record was written. This document records execution status without inventing validator observations.

## Execution status

- Corpus: 24 frozen cases (`B01`–`B24`)
- Expected outcomes: `FULFILLED` 6, `BREACHED` 6, `INCONCLUSIVE` 12
- Independent GenLayer validator execution: **NOT EXECUTED — TOOLING-LIMITED**
- Observed outcomes: **NOT EXECUTED — TOOLING-LIMITED** for all 24 cases
- Exact matches: **NOT MEASURED**
- Accuracy: **NOT MEASURED**
- False fulfillment rate: **NOT MEASURED**
- False breach rate: **NOT MEASURED**
- Unsafe-conclusion rate: **NOT MEASURED**
- Conservative-inconclusive rate: **NOT MEASURED**

The local simulator has no independent nondeterministic web/validator execution surface capable of producing credible observations for these cases. Recording expected outcomes as observed results would invalidate the benchmark. Therefore there are no mismatches to report, but there is also no calibration claim.

## Coverage that was executable locally

The simulator and Direct Mode suites do validate deterministic boundaries related to the benchmark: unavailable and oversized evidence remain inconclusive, unknown validator verdicts are rejected, terminal and duplicate reviews are rejected, and settlement remains caller- and registration-gated. Those checks are protocol behavior checks, not a substitute for a real validator calibration run.

## Required follow-up

Run the frozen corpus against an independent validator harness with controlled fixtures and archive the raw verdicts, source snapshots, validator agreement, and finality evidence. This document must be amended only with observed results; `benchmarks/JUDGMENT_BENCHMARK.md` must remain unchanged.
