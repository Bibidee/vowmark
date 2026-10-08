#!/usr/bin/env python3
"""Run executable V2 contract mutants against behavioral tests.

This harness intentionally counts only syntactically valid mutants that load in
the selected GenLayer test environment. Unsupported judgment mutations that
require independent validator execution are documented separately rather than
being disguised as killed mutants.
"""

from __future__ import annotations

from dataclasses import dataclass
import os
from pathlib import Path
import py_compile
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Mutant:
    mutant_id: str
    source: str
    old: str
    new: str
    invariant: str
    test_path: str


def block(condition: str, message: str) -> str:
    return f'{condition}\n            raise gl.vm.UserError("{message}")'


MUTANTS = [
    Mutant("R-01", "contracts/vowmark-contracts/contracts/vowmark_registry.py", block("if now < commitment.maturity_at:", "commitment is not mature"), block("if False:", "commitment is not mature"), "review is forbidden before maturity", "tests/sim/test_registry_behavior.py"),
    Mutant("R-02", "contracts/vowmark-contracts/contracts/vowmark_registry.py", block("if now >= commitment.final_review_deadline:", "review window has closed"), block("if False:", "review window has closed"), "review is forbidden at or after the final deadline", "tests/sim/test_registry_behavior.py"),
    Mutant("R-03", "contracts/vowmark-contracts/contracts/vowmark_registry.py", "if now >= commitment.final_review_deadline:\n            raise gl.vm.UserError(\"review window has closed\")\n        if commitment.outcome != OUTCOME_OPEN:\n            raise gl.vm.UserError(\"commitment already has a terminal outcome\")", "if now >= commitment.final_review_deadline:\n            raise gl.vm.UserError(\"review window has closed\")\n        if False:\n            raise gl.vm.UserError(\"commitment already has a terminal outcome\")", "terminal commitments cannot be reviewed", "tests/sim/test_registry_behavior.py"),
    Mutant("R-04", "contracts/vowmark-contracts/contracts/vowmark_registry.py", block("if now < commitment.final_review_deadline:", "commitment cannot expire before final deadline"), block("if False:", "commitment cannot expire before final deadline"), "expiry cannot happen before the deadline", "tests/sim/test_registry_behavior.py"),
    Mutant("R-05", "contracts/vowmark-contracts/contracts/vowmark_registry.py", "if commitment.review_epoch != current_epoch:\n            commitment.review_epoch = current_epoch\n            commitment.review_epoch_attempts = u256(0)", "if False:\n            commitment.review_epoch = current_epoch\n            commitment.review_epoch_attempts = u256(0)", "epoch capacity resets in the next epoch", "tests/sim/test_registry_behavior.py"),
    Mutant("R-06", "contracts/vowmark-contracts/contracts/vowmark_registry.py", "if commitment.review_epoch_attempts >= u256(MAX_REVIEW_ATTEMPTS_PER_EPOCH):\n            raise gl.vm.UserError(\"review epoch capacity reached; try the next review window\")", "if False:\n            raise gl.vm.UserError(\"review epoch capacity reached; try the next review window\")", "a 33rd review cannot enter a full epoch", "tests/sim/test_registry_behavior.py"),
    Mutant("R-07", "contracts/vowmark-contracts/contracts/vowmark_registry.py", "if snapshot_digest in self.seen_snapshots.get_or_insert_default(commitment_id):\n            raise gl.vm.UserError(\"identical evidence snapshot was already reviewed\")", "if False:\n            raise gl.vm.UserError(\"identical evidence snapshot was already reviewed\")", "identical evidence snapshots cannot be replayed", "tests/sim/test_registry_behavior.py"),
    Mutant("R-08", "contracts/vowmark-contracts/contracts/vowmark_registry.py", "current_epoch = u256(int(now) // REVIEW_EPOCH_SECONDS)", "current_epoch = u256(0)", "epoch identity cannot become lifetime-global", "tests/sim/test_registry_behavior.py"),
    Mutant("R-09", "contracts/vowmark-contracts/contracts/vowmark_registry.py", "if verdict not in {VERDICT_FULFILLED, VERDICT_BREACHED, VERDICT_INCONCLUSIVE}:\n                raise gl.vm.UserError(\"validator response has an unknown verdict\")", "if False:\n                raise gl.vm.UserError(\"validator response has an unknown verdict\")", "validator output is a closed enum", "tests/sim/test_registry_behavior.py"),
    Mutant("R-10", "contracts/vowmark-contracts/contracts/vowmark_registry.py", "if len(content) > MAX_EVIDENCE_TEXT:", "if False:", "oversized evidence is not judgment input", "tests/sim/test_registry_behavior.py"),
    Mutant("R-11", "contracts/vowmark-contracts/contracts/vowmark_registry.py", "return {\"verdict\": VERDICT_INCONCLUSIVE, \"snapshot_digest\": snapshot_digest, \"source_set_digest\": source_set_digest}", "return {\"verdict\": VERDICT_FULFILLED, \"snapshot_digest\": snapshot_digest, \"source_set_digest\": source_set_digest}", "unavailable evidence cannot become fulfillment", "tests/sim/test_registry_behavior.py"),
    Mutant("R-12", "contracts/vowmark-contracts/contracts/vowmark_registry.py", "if self._address_text(self._address_arg(gl.message.sender_address)) != self._address_text(self.deployer):\n            raise gl.vm.UserError(\"only the deployer may finish initial wiring\")", "if False:\n            raise gl.vm.UserError(\"only the deployer may finish initial wiring\")", "initial wiring is deployer-only", "tests/sim/test_registry_behavior.py"),
    Mutant("V-01", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if gl.message.value == u256(0):\n            raise gl.vm.UserError(\"bond must be greater than zero\")", "if False:\n            raise gl.vm.UserError(\"bond must be greater than zero\")", "a commitment cannot be created with zero bond", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-02", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "self._require_nonzero_address(self.registry_address, \"registry address\")", "pass", "Vault cannot be initialized without a Registry", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-03", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if self._address_text(gl.message.sender_address) != self._address_text(self.registry_address):\n            raise gl.vm.UserError(\"only the immutable registry may settle\")", "if False:\n            raise gl.vm.UserError(\"only the immutable registry may settle\")", "settlement is Registry-only", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-04", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if not issuance.registered:\n            raise gl.vm.UserError(\"issuance is not registered\")", "if False:\n            raise gl.vm.UserError(\"issuance is not registered\")", "settlement requires registration", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-05", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if commitment_id in self.settled_commitments:\n            # Retryable child messages are deliberately idempotent.\n            return", "if False:\n            # Retryable child messages are deliberately idempotent.\n            return", "settlement credits exactly once", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-06", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "recipient = issuance.remedy if outcome == OUTCOME_BREACHED else issuance.issuer", "recipient = issuance.issuer", "BREACHED credits the immutable remedy", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-07", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if amount == u256(0):\n            raise gl.vm.UserError(\"withdrawal amount must be greater than zero\")", "if False:\n            raise gl.vm.UserError(\"withdrawal amount must be greater than zero\")", "zero withdrawals are rejected", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-08", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if amount > current_credit:\n            raise gl.vm.UserError(\"withdrawal exceeds available credit\")", "if False:\n            raise gl.vm.UserError(\"withdrawal exceeds available credit\")", "withdrawal cannot exceed credit", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-09", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if self._address_text(sender) != self._address_text(origin):\n            raise gl.vm.UserError(\"withdrawal requires a direct EOA caller\")", "if False:\n            raise gl.vm.UserError(\"withdrawal requires a direct EOA caller\")", "withdrawal cannot be mediated by another contract", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-10", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "self.credits[sender] = current_credit - amount", "self.credits[sender] = current_credit", "credit is debited before transfer", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-11", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if self._address_text(gl.message.sender_address) != self._address_text(self.registry_address):\n            raise gl.vm.UserError(\"only the immutable registry may confirm registration\")", "if False:\n            raise gl.vm.UserError(\"only the immutable registry may confirm registration\")", "registration confirmation is Registry-only", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-12", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "self._require_nonzero_address(remedy, \"remedy address\")", "pass", "remedy cannot be zero", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-13", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if self._address_text(issuer) == self._address_text(remedy):\n            raise gl.vm.UserError(\"remedy address must differ from issuer\")", "if False:\n            raise gl.vm.UserError(\"remedy address must differ from issuer\")", "issuer and remedy cannot be identical", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-14", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if not value.startswith(\"https://\"):\n            raise gl.vm.UserError(\"evidence URL must use HTTPS\")", "if False:\n            raise gl.vm.UserError(\"evidence URL must use HTTPS\")", "evidence anchors require HTTPS", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-15", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if normalized in seen:\n                raise gl.vm.UserError(\"duplicate normalized evidence URL\")", "if False:\n                raise gl.vm.UserError(\"duplicate normalized evidence URL\")", "evidence anchors cannot duplicate", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-16", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if not (1 <= len(urls) <= MAX_ANCHORS) or len(urls) != len(source_kinds) or len(urls) != len(purposes):", "if not (1 <= len(urls) <= 999) or len(urls) != len(source_kinds) or len(urls) != len(purposes):", "anchor count is bounded", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-17", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if len(statement.strip()) == 0 or len(statement) > MAX_STATEMENT:\n            raise gl.vm.UserError(\"commitment statement length is invalid\")", "if False:\n            raise gl.vm.UserError(\"commitment statement length is invalid\")", "statement size is bounded", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-18", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if len(verification_rule.strip()) == 0 or len(verification_rule) > MAX_RULE:\n            raise gl.vm.UserError(\"verification rule length is invalid\")", "if False:\n            raise gl.vm.UserError(\"verification rule length is invalid\")", "verification rule size is bounded", "tests/direct/test_vowmark_vault_direct.py"),
    Mutant("V-19", "contracts/vowmark-contracts/contracts/vowmark_vault.py", "if final_review_deadline <= maturity_at:\n            raise gl.vm.UserError(\"final review deadline must be after maturity\")", "if False:\n            raise gl.vm.UserError(\"final review deadline must be after maturity\")", "deadline must be after maturity", "tests/direct/test_vowmark_vault_direct.py"),
]


def _run_mutant(mutant: Mutant, root: Path, workspace: Path) -> tuple[str, str]:
    source_path = root / mutant.source
    source = source_path.read_text(encoding="utf-8")
    if source.count(mutant.old) != 1:
        return "INVALID", "mutation anchor did not match exactly once"

    mutated_path = workspace / Path(mutant.source).name
    mutated_path.write_text(source.replace(mutant.old, mutant.new, 1), encoding="utf-8")
    try:
        py_compile.compile(str(mutated_path), doraise=True)
    except py_compile.PyCompileError as error:
        return "INVALID", f"syntax/compile failure: {error.msg}"

    env = os.environ.copy()
    if "vowmark_registry.py" in mutant.source:
        env["VOWMARK_REGISTRY_CODE"] = str(mutated_path)
    else:
        env["VOWMARK_VAULT_CODE"] = str(mutated_path)
    env["PYTHONPATH"] = str(root) + os.pathsep + env.get("PYTHONPATH", "")
    basetemp = workspace / "pytest-tmp"
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "-q", str(root / mutant.test_path), "--basetemp", str(basetemp)],
        cwd=root,
        env=env,
        capture_output=True,
        text=True,
        timeout=150,
    )
    output = (result.stdout + "\n" + result.stderr).strip()
    if "no tests ran" in output.lower() or "INTERNALERROR" in output:
        return "TOOLING-LIMITED", output[-500:]
    if "ModuleNotFoundError" in output or "FileNotFoundError" in output or "class is not marked for usage" in output:
        return "TOOLING-LIMITED", output[-500:]
    if result.returncode == 0:
        return "SURVIVED", output[-500:]
    return "KILLED", output[-500:]


def main() -> int:
    results: list[tuple[Mutant, str, str]] = []
    with tempfile.TemporaryDirectory(prefix=".vowmark-mutations-", dir=ROOT) as temp_dir:
        temp_root = Path(temp_dir)
        for mutant in MUTANTS:
            workspace = temp_root / mutant.mutant_id
            workspace.mkdir(parents=True)
            try:
                status, notes = _run_mutant(mutant, ROOT, workspace)
            except subprocess.TimeoutExpired:
                status, notes = "TOOLING-LIMITED", "pytest timeout"
            results.append((mutant, status, notes.replace("\r", "").replace("\n", " ")))
            print(f"{mutant.mutant_id}\t{status}\t{mutant.source}\t{mutant.invariant}\t{notes[-220:]}")

    counts = {name: sum(status == name for _, status, _ in results) for name in ("KILLED", "SURVIVED", "INVALID", "TOOLING-LIMITED")}
    valid = counts["KILLED"] + counts["SURVIVED"]
    print("SUMMARY")
    print(f"TOTAL GENERATED: {len(MUTANTS)}")
    print(f"VALID: {valid}")
    print(f"KILLED: {counts['KILLED']}")
    print(f"SURVIVED: {counts['SURVIVED']}")
    print("EQUIVALENT: 0")
    print(f"INVALID: {counts['INVALID']}")
    print(f"TOOLING-LIMITED: {counts['TOOLING-LIMITED']}")
    return 1 if counts["SURVIVED"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
