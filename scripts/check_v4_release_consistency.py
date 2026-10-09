#!/usr/bin/env python3
"""Check that the V4 remediation branch is self-consistent and undeployed."""

from __future__ import annotations

import re
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
        branch = git_output("branch", "--show-current")
        if branch != "v4-security-remediation":
            fail(f"expected v4-security-remediation branch, found {branch or 'detached HEAD'}")

        config = read("web/lib/config.ts")
        if "id: 61999" not in config or 'hexId: "0xf22f"' not in config:
            fail("frontend config drifted from Studionet 61999")
        production = read("evidence/FINAL_PROOF_MATRIX.md")
        if "https://the-vowmark.vercel.app/" not in production:
            fail("the authorized production alias is missing from the frozen V1 proof matrix")

        registry = read("contracts/vowmark-contracts/contracts/vowmark_registry.py")
        vault = read("contracts/vowmark-contracts/contracts/vowmark_vault.py")
        required_source_markers = (
            "LATE_REVIEW_RESERVE_SECONDS",
            "MAX_LATE_REVIEW_ATTEMPTS",
            "MAX_VERDICT_RESPONSE",
            "BEGIN_UNTRUSTED_COMMITMENT_JSON",
            "reject_duplicate_keys",
            "STRUCTURALLY_VERIFIED_REVISION",
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
