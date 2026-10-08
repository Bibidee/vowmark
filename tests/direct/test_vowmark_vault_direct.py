"""Direct Mode behavioral checks for the Vault custody boundary.

Run with:
    .venv-direct\\Scripts\\python.exe -m pytest tests/direct -q -p gltest_direct
"""

from pathlib import Path
import os
import pytest


pytest.importorskip("gltest.direct.pytest_plugin")
REGISTRY = "0x" + ("11" * 20)
ISSUER = "0x" + ("22" * 20)
REMEDY = "0x" + ("33" * 20)
VAULT = os.environ.get("VOWMARK_VAULT_CODE", "contracts/vowmark-contracts/contracts/vowmark_vault.py")


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


def test_vault_rejects_zero_bond(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    direct_vm.value = 0
    with direct_vm.prank(ISSUER):
        with direct_vm.expect_revert("bond must be greater than zero"):
            vault.create_commitment(*_issue_args())


def test_vault_rejects_invalid_creation_roles_and_anchor_policy(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    direct_vm.value = 100
    with direct_vm.prank(ISSUER):
        with direct_vm.expect_revert("remedy address must differ from issuer"):
            args = list(_issue_args())
            args[4] = ISSUER
            vault.create_commitment(*args)
        with direct_vm.expect_revert("remedy address must be nonzero"):
            args = list(_issue_args())
            args[4] = "0x" + ("00" * 20)
            vault.create_commitment(*args)
        with direct_vm.expect_revert("evidence URL must use HTTPS"):
            args = list(_issue_args())
            args[5] = ["http://example.com/evidence"]
            vault.create_commitment(*args)
        with direct_vm.expect_revert("duplicate normalized evidence URL"):
            args = list(_issue_args())
            args[5] = ["https://example.com/evidence", "https://example.com/evidence"]
            args[6] = ["PUBLICATION", "PUBLICATION"]
            args[7] = ["one", "two"]
            vault.create_commitment(*args)
        with direct_vm.expect_revert("evidence anchor fields are invalid"):
            args = list(_issue_args())
            args[5] = [f"https://example.com/evidence-{index}" for index in range(6)]
            args[6] = ["PUBLICATION"] * 6
            args[7] = ["proof"] * 6
            vault.create_commitment(*args)
        with direct_vm.expect_revert("commitment statement length is invalid"):
            args = list(_issue_args())
            args[0] = "x" * 2_001
            vault.create_commitment(*args)
        with direct_vm.expect_revert("verification rule length is invalid"):
            args = list(_issue_args())
            args[1] = "x" * 3_001
            vault.create_commitment(*args)
        with direct_vm.expect_revert("final review deadline must be after maturity"):
            args = list(_issue_args())
            args[3] = args[2]
            vault.create_commitment(*args)


def test_vault_starts_empty_and_binds_registry(direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    assert vault.get_registry() == REGISTRY
    assert vault.get_credit(ISSUER) == 0
    assert vault.get_settled(1) is False


def test_vault_rejects_non_registry_settlement(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    with direct_vm.expect_revert("only the immutable registry may settle"):
        vault.settle(1, "FULFILLED")


def test_vault_rejects_zero_registry_constructor(direct_vm, direct_deploy, tmp_path):
    with direct_vm.expect_revert("registry address must be nonzero"):
        direct_deploy(_direct_compatible_copy(VAULT, tmp_path), "0x" + ("00" * 20), sdk_version="v0.2.16")


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


def test_vault_rejects_settlement_before_registration(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    direct_vm.value = 100
    with direct_vm.prank(ISSUER):
        commitment_id = vault.create_commitment(*_issue_args())
    with direct_vm.prank(REGISTRY):
        with direct_vm.expect_revert("issuance is not registered"):
            vault.settle(commitment_id, "FULFILLED")


def test_vault_rejects_non_registry_registration_confirmation(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    direct_vm.value = 100
    with direct_vm.prank(ISSUER):
        commitment_id = vault.create_commitment(*_issue_args())
    with direct_vm.prank(ISSUER):
        with direct_vm.expect_revert("only the immutable registry may confirm registration"):
            vault.confirm_registration(commitment_id)


def test_vault_rejects_withdrawal_above_credit_and_debits_before_send(direct_vm, direct_deploy, tmp_path):
    vault = direct_deploy(_direct_compatible_copy(VAULT, tmp_path), REGISTRY, sdk_version="v0.2.16")
    direct_vm.value = 100
    with direct_vm.prank(ISSUER):
        commitment_id = vault.create_commitment(*_issue_args())
    with direct_vm.prank(REGISTRY):
        vault.confirm_registration(commitment_id)
        vault.settle(commitment_id, "BREACHED")
    assert vault.get_credit(REMEDY) == 100
    assert vault.get_withdrawal_policy()["requires_sender_equals_origin"] is True
    direct_vm.origin = REMEDY
    with direct_vm.prank(REMEDY):
        with direct_vm.expect_revert("withdrawal amount must be greater than zero"):
            vault.withdraw(0)
        with direct_vm.expect_revert("withdrawal exceeds available credit"):
            vault.withdraw(101)
        vault.withdraw(60)
        with direct_vm.expect_revert("withdrawal exceeds available credit"):
            vault.withdraw(60)
        direct_vm.origin = ISSUER
        with direct_vm.expect_revert("withdrawal requires a direct EOA caller"):
            vault.withdraw(1)
        direct_vm.origin = None
    direct_vm.origin = ISSUER
    with direct_vm.prank(ISSUER):
        with direct_vm.expect_revert("withdrawal exceeds available credit"):
            vault.withdraw(1)
    direct_vm.origin = None
    assert vault.get_credit(REMEDY) == 40
