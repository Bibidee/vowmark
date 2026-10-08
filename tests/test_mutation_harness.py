import sys
from pathlib import Path


SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from run_mutation_tests import mutation_gate_exit_code  # noqa: E402


def counts(**overrides: int) -> dict[str, int]:
    result = {"SURVIVED": 0, "INVALID": 0, "TOOLING-LIMITED": 0}
    result.update(overrides)
    return result


def test_mutation_gate_accepts_all_killed_inventory() -> None:
    assert mutation_gate_exit_code(counts()) == 0


def test_mutation_gate_rejects_survivor() -> None:
    assert mutation_gate_exit_code(counts(SURVIVED=1)) != 0


def test_mutation_gate_rejects_invalid_mutant() -> None:
    assert mutation_gate_exit_code(counts(INVALID=1)) != 0


def test_mutation_gate_rejects_tooling_limited_mutant() -> None:
    assert mutation_gate_exit_code(counts(**{"TOOLING-LIMITED": 1})) != 0
