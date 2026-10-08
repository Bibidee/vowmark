"""Direct Mode behavioral checks for the Vault custody boundary.

Run with:
    .venv-direct\\Scripts\\python.exe -m pytest tests/direct -q -p gltest_direct
"""

from pathlib import Path
import pytest


pytest.importorskip("gltest.direct.pytest_plugin")
REGISTRY = "0x" + ("11" * 20)
ISSUER = "0x" + ("22" * 20)
REMEDY = "0x" + ("33" * 20)
VAULT = "contracts/vowmark-contracts/contracts/vowmark_vault.py"


def _direct_compatible_copy(source, tmp_path):
    target = tmp_path / Path(source).name
    target.write_text(Path(source).read_text(encoding="utf-8").replace(
        '"Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6"',
        '"Depends": "py-genlayer:latest"',
    ), encoding="utf-8")
    return str(target)


def _issue_args():
    return (
        "A direct custody test commitment",
        "Fulfilled means the frozen public evidence contains the required record.",
        1_800_000_000,
        1_800_007_200,
        REMEDY,
        ["https://example.com/evidence"],
        ["PUBLICATION"],
        ["test evidence"],
    )


def test_vault_starts_empty_and_binds_registry(direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    assert vault.get_registry() == REGISTRY
    assert vault.get_credit(ISSUER) == 0
    assert vault.get_settled(1) is False


def test_vault_rejects_non_registry_settlement(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    with direct_vm.expect_revert("only the immutable registry may settle"):
        vault.settle(1, "FULFILLED")


def test_vault_credits_exactly_once_after_registration(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    direct_vm.value = 100
    with direct_vm.prank(ISSUER):
        commitment_id = vault.create_commitment(*_issue_args())
    assert commitment_id == 0
    assert vault.get_credit(ISSUER) == 0

    with direct_vm.prank(REGISTRY):
        vault.confirm_registration(commitment_id)
        vault.settle(commitment_id, "FULFILLED")
        vault.settle(commitment_id, "FULFILLED")

    assert vault.get_credit(ISSUER) == 100
    assert vault.get_settled(commitment_id) is True


def test_vault_rejects_withdrawal_above_credit_and_debits_before_send(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    direct_vm.value = 100
    with direct_vm.prank(ISSUER):
        commitment_id = vault.create_commitment(*_issue_args())
    with direct_vm.prank(REGISTRY):
        vault.confirm_registration(commitment_id)
        vault.settle(commitment_id, "BREACHED")
    assert vault.get_credit(REMEDY) == 100
    with direct_vm.prank(REMEDY):
        with direct_vm.expect_revert("withdrawal exceeds available credit"):
            vault.withdraw(101)
        vault.withdraw(60)
        with direct_vm.expect_revert("withdrawal exceeds available credit"):
            vault.withdraw(60)
    assert vault.get_credit(REMEDY) == 40
