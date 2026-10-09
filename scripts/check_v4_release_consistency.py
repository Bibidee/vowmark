#!/usr/bin/env python3
"""Check that the V4 remediation branch is self-consistent and undeployed."""

from __future__ import annotations

import re
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    raise AssertionError(message)


def read(relative: str) -> str:
    path = ROOT / relative
    if not path.is_file():
        fail(f"missing V4 release artifact: {relative}")
    return path.read_text(encoding="utf-8")


def git_output(*args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if result.returncode != 0:
        fail(result.stderr.strip() or result.stdout.strip() or f"git {' '.join(args)} failed")
    return result.stdout.strip()


def count(report: str, label: str) -> int:
    match = re.search(rf"^{re.escape(label)}:\s*(\d+)\s*$", report, re.MULTILINE)
    if not match:
        fail(f"V4 mutation report is missing {label}")
    return int(match.group(1))


def main() -> int:
    try:
        branch = os.environ.get("GITHUB_HEAD_REF") or os.environ.get("GITHUB_REF_NAME") or git_output("branch", "--show-current")
        if branch != "v4-security-remediation":
            fail(f"expected v4-security-remediation branch, found {branch or 'detached HEAD'}")

        config = read("web/lib/config.ts")
        if "id: 61999" not in config or 'hexId: "0xf22f"' not in config:
            fail("frontend config drifted from Studionet 61999")
        if 'RELEASE_TRACK = "V4_CANDIDATE"' not in config:
            fail("frontend config is not explicitly marked as the V4 candidate")
        if 'process.env.NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS ||\n  ""' not in config or 'process.env.NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS ||\n  ""' not in config:
            fail("V4 frontend config must leave contract addresses unassigned until deployment")
        if "0x3Be513bB6CAe652826A6092C0715AF39E7189c71" in config or "0xf8D89f89aD160546780eD76Cd64C550d91bAf501" in config:
            fail("V4 frontend config must not embed the authorized V1 contract addresses")
        production = read("evidence/FINAL_PROOF_MATRIX.md")
        if "https://the-vowmark.vercel.app/" not in production:
            fail("the authorized production alias is missing from the frozen V1 proof matrix")

        registry = read("contracts/vowmark-contracts/contracts/vowmark_registry.py")
        vault = read("contracts/vowmark-contracts/contracts/vowmark_vault.py")
        if "MIN_REVIEW_WINDOW = 20 * 60" not in registry or "MIN_REVIEW_WINDOW = 20 * 60" not in vault:
            fail("V4 contract pair is not aligned to the 20-minute minimum review window")
        if "minimumWindowSeconds: 20 * 60" not in config:
            fail("V4 frontend policy is not aligned to the 20-minute minimum review window")
        required_source_markers = (
            "LATE_REVIEW_RESERVE_SECONDS",
            "MAX_LATE_REVIEW_ATTEMPTS",
            "MAX_VERDICT_RESPONSE",
            "BEGIN_UNTRUSTED_COMMITMENT_JSON",
            "reject_duplicate_keys",
            "STRUCTURALLY_VERIFIED_REVISION",
            "hex_prefix",
            "alternate_numeric",
        )
        for marker in required_source_markers:
            if marker not in registry:
                fail(f"Registry is missing V4 marker: {marker}")
        for marker in ("sender equals origin", "failure_recovery", "external finalized transfer"):
            if marker not in vault:
                fail(f"Vault is missing V4 marker: {marker}")

        release = read("docs/V4_SECURITY_REMEDIATION.md")
        if "not deployed" not in release.lower() or "not promoted" not in release.lower():
            fail("V4 report does not preserve the undeployed/not-promoted status")
        if "15-minute" not in release or "20-minute" not in release:
            fail("V4 report does not distinguish V1 and V4 timing policies")
        deployment = read("docs/DEPLOYMENT.md")
        for marker in ("Production V1", "Candidate V4", "900", "1200", "V4 has no contract addresses yet"):
            if marker not in deployment:
                fail(f"deployment runbook is missing V1/V4 separation marker: {marker}")
        readme = read("README.md")
        for marker in ("Release tracks", "Production V1", "Candidate V4", "V1 contracts do not enforce V4"):
            if marker not in readme:
                fail(f"README is missing V1/V4 separation marker: {marker}")
        evidence_matrix = read("evidence/FINAL_PROOF_MATRIX.md")
        if "authorized **V1**" not in evidence_matrix or "15 minutes" not in evidence_matrix:
            fail("final proof matrix is not clearly identified as V1 evidence")
        report = read("docs/V4_MUTATION_TEST_REPORT.md")
        sys.path.insert(0, str(ROOT / "scripts"))
        from run_mutation_tests import MUTANTS  # noqa: PLC0415

        total = count(report, "TOTAL GENERATED")
        valid = count(report, "VALID")
        killed = count(report, "KILLED")
        survived = count(report, "SURVIVED")
        invalid = count(report, "INVALID")
        tooling = count(report, "TOOLING-LIMITED")
        if total != len(MUTANTS) or valid != killed + survived or total != valid + invalid + tooling:
            fail("V4 mutation report does not match the executable inventory")
        if (survived, invalid, tooling) != (0, 0, 0):
            fail("V4 mutation report is not green")
    except (AssertionError, OSError) as error:
        print(f"V4 RELEASE CONSISTENCY: FAIL: {error}", file=sys.stderr)
        return 1
    print("V4 RELEASE CONSISTENCY: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
