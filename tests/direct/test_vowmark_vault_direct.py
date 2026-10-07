"""Direct Mode checks for the finalized-only VOWMARK custody boundary.

Run with the isolated current test runner:
    .venv-direct\\Scripts\\python.exe -m pytest tests/direct -q -p gltest_direct

The repository's pinned CLI environment skips this module because the direct
fixtures were introduced after the pinned 0.39.1-era test package.
"""

from pathlib import Path
import sys

import pytest


pytest.importorskip("gltest.direct.pytest_plugin")
pytestmark = pytest.mark.xfail(
    sys.platform == "win32",
    reason="genlayer-test 0.29.2 Direct Mode closes its stdin temp file too late on Windows",
    strict=False,
)


REGISTRY = "0x" + ("11" * 20)
VAULT = "contracts/vowmark-contracts/contracts/vowmark_vault.py"


def _direct_compatible_copy(source, tmp_path):
    """Use the current Direct Mode runner while preserving production source."""
    target = tmp_path / Path(source).name
    target.write_text(
        Path(source).read_text(encoding="utf-8").replace(
            '"Depends": "py-genlayer:test"',
            '"Depends": "py-genlayer:latest"',
        ),
        encoding="utf-8",
    )
    return str(target)


def test_vault_starts_empty_and_binds_registry(direct_deploy, tmp_path):
    vault = direct_deploy(
        _direct_compatible_copy(VAULT, tmp_path),
        REGISTRY,
        sdk_version="v0.3.0-rc7",
    )

    assert vault.get_registry() == REGISTRY
    assert vault.get_credit("0x" + ("22" * 20)) == 0
    assert vault.get_settled(1) is False


def test_vault_rejects_non_registry_settlement(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(
        _direct_compatible_copy(VAULT, tmp_path),
        REGISTRY,
        sdk_version="v0.3.0-rc7",
    )
    direct_vm.value = 100

    with direct_vm.expect_revert("only the immutable registry may settle"):
        vault.settle(1, "0x" + ("22" * 20), 100)
