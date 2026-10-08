#!/usr/bin/env python3
"""Check that V2 source, provenance, and release evidence agree.

This is intentionally local and deterministic. It catches stale network IDs,
contract defaults, SHAs, mutation summaries, and Vercel wording without
depending on a live RPC, GitHub, or Vercel API response.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
V1_BASE = "97b5ca8888eeaca3d2b1deb733c832c8448d4383"
BENCHMARK_FREEZE = "cefd2808340086beb8810f5bff63dd7ad8ee4865"
V1_REGISTRY = "0x3Be513bB6CAe652826A6092C0715AF39E7189c71"
V1_VAULT = "0xf8D89f89aD160546780eD76Cd64C550d91bAf501"
V1_ALIAS = "https://the-vowmark.vercel.app/"
V2_SHA = "c35836cd171035cbbbf9c13fd4cc403147c69433"


def fail(message: str) -> None:
    raise AssertionError(message)


def read(relative: str) -> str:
    path = ROOT / relative
    if not path.is_file():
        fail(f"missing required evidence file: {relative}")
    return path.read_text(encoding="utf-8")


def check_network_source() -> None:
    runtime_roots = (ROOT / "web", ROOT / "contracts" / "vowmark-contracts" / "contracts")
    checked = 0
    for directory in runtime_roots:
        for path in directory.rglob("*"):
            if not path.is_file() or "node_modules" in path.parts or ".next" in path.parts:
                continue
            if path.suffix not in {".ts", ".tsx", ".py", ".json", ".toml", ".yml", ".yaml"}:
                continue
            checked += 1
            text = path.read_text(encoding="utf-8", errors="replace").lower()
            if "61997" in text or "studio-dev" in text:
                fail(f"forbidden Studio-dev network reference in {path.relative_to(ROOT)}")
    if checked == 0:
        fail("no runtime source files were checked for network drift")

    config = read("web/lib/config.ts")
    if "id: 61999" not in config or 'hexId: "0xf22f"' not in config:
        fail("frontend Studionet defaults do not identify chain 61999 / 0xf22f")


def check_contract_defaults() -> None:
    config = read("web/lib/config.ts")
    registry = re.search(r"NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS[\s\S]*?\n\s*\"([^\"]+)\"", config)
    vault = re.search(r"NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS[\s\S]*?\n\s*\"([^\"]+)\"", config)
    if not registry or registry.group(1).lower() != V1_REGISTRY.lower():
        fail("frontend Registry default does not match the frozen V1 deployment")
    if not vault or vault.group(1).lower() != V1_VAULT.lower():
        fail("frontend Vault default does not match the frozen V1 deployment")


def check_provenance_and_wording() -> None:
    baseline = read("docs/V2_BASELINE_AUDIT.md")
    if V1_BASE not in baseline:
        fail("V2 baseline audit does not contain the full frozen V1 base SHA")

    benchmark = read("benchmarks/JUDGMENT_BENCHMARK_RESULTS.md")
    if BENCHMARK_FREEZE not in benchmark:
        fail("benchmark results do not preserve the full frozen definition SHA")
    if "independent genlayer validator execution: **not executed — tooling-limited**" not in benchmark.lower():
        fail("benchmark execution status is not the honest tooling-limited status")

    evidence = read("docs/V2_RELEASE_EVIDENCE.md")
    required_evidence = (V2_SHA, "6937842763", "environment: Preview", V1_ALIAS, "not promoted")
    for marker in required_evidence:
        if marker.lower() not in evidence.lower():
            fail(f"V2 release evidence is missing: {marker}")

    v2_docs = [
        "docs/V2_BASELINE_AUDIT.md",
        "docs/V2_TEST_COVERAGE.md",
        "docs/MUTATION_TEST_REPORT.md",
        "docs/CONSENSUS_DESIGN_REVIEW.md",
        "docs/V2_RELEASE_EVIDENCE.md",
        "benchmarks/JUDGMENT_BENCHMARK_RESULTS.md",
    ]
    forbidden_claims = ("v2 production replaced v1", "no v2 preview or production deployment was created", "no v2 deployment exists")
    for relative in v2_docs:
        text = read(relative).lower()
        for phrase in forbidden_claims:
            if phrase in text:
                fail(f"stale V2 production claim in {relative}: {phrase}")

    if "KEEP STRICT_EQ" not in read("docs/CONSENSUS_DESIGN_REVIEW.md"):
        fail("consensus review does not preserve KEEP STRICT_EQ")
    if "NO CONTRACT REDEPLOYMENT" not in evidence:
        fail("V2 release evidence does not state NO CONTRACT REDEPLOYMENT")


def check_mutation_report() -> None:
    sys.path.insert(0, str(ROOT / "scripts"))
    from run_mutation_tests import MUTANTS  # noqa: PLC0415

    report = read("docs/MUTATION_TEST_REPORT.md")

    def count(label: str) -> int:
        match = re.search(rf"^{re.escape(label)}:\s*(\d+)\s*$", report, re.MULTILINE)
        if not match:
            fail(f"mutation report is missing {label}")
        return int(match.group(1))

    total = count("TOTAL GENERATED")
    valid = count("VALID")
    killed = count("KILLED")
    survived = count("SURVIVED")
    invalid = count("INVALID")
    tooling = count("TOOLING-LIMITED")
    if total != len(MUTANTS):
        fail(f"mutation report total {total} does not match executable inventory {len(MUTANTS)}")
    if valid != killed + survived or total != valid + invalid + tooling:
        fail("mutation report counts do not form a complete inventory")
    if (survived, invalid, tooling) != (0, 0, 0):
        fail("mutation report contains a non-green release-gate category")


def main() -> int:
    checks = (
        ("network source", check_network_source),
        ("contract defaults", check_contract_defaults),
        ("provenance and release wording", check_provenance_and_wording),
        ("mutation report", check_mutation_report),
    )
    try:
        for name, check in checks:
            check()
            print(f"PASS: {name}")
    except (AssertionError, OSError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1
    print("RELEASE CONSISTENCY: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
