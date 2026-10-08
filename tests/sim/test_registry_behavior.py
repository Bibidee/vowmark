"""Registry behavior checks against the persistent GenLayer simulator.

The simulator is used here because Registry and Vault behavior includes
finalized cross-contract messages; isolated unit tests cannot prove those
messages or the resulting custody state.
"""

from __future__ import annotations

from datetime import datetime, timezone
import re

import pytest

# Reuse the Windows Direct Mode stdin compatibility patch used by the
# ordinary Direct Mode suite.
from tests.direct import conftest as _direct_compat  # noqa: F401
pytest.importorskip("glsim", reason="simulator behavior tests run in the simulator-registry CI job")
from glsim.engine import SimEngine
from glsim.state import StateStore


REGISTRY_CODE = "contracts/vowmark-contracts/contracts/vowmark_registry.py"
VAULT_CODE = "contracts/vowmark-contracts/contracts/vowmark_vault.py"
DEPLOYER = "0x" + ("aa" * 20)
ISSUER = "0x" + ("11" * 20)
REMEDY = "0x" + ("22" * 20)
REVIEWER_A = "0x" + ("33" * 20)
REVIEWER_B = "0x" + ("44" * 20)
REVIEWER_C = "0x" + ("55" * 20)
ZERO = "0x" + ("00" * 20)


def _timestamp(iso_value: str) -> int:
    return int(datetime.fromisoformat(iso_value.replace("Z", "+00:00")).timestamp())


def _warp(engine: SimEngine, iso_value: str) -> None:
    engine.vm.warp(iso_value)
    # genlayer-test 0.29.2 refreshes sender/value but not the raw datetime;
    # keep the simulator's raw message aligned for contract _now() helpers.
    import genlayer.gl as gl

    gl.message_raw["datetime"] = iso_value


@pytest.fixture
def deployed():
    # genlayer-test's optional embedding helper is not needed for these
    # deterministic mock-based checks and is not present in every CI image.
    import gltest.direct.loader as loader

    original_embedding_patch = loader._mock_embeddings_for_direct_mode
    loader._mock_embeddings_for_direct_mode = lambda: None
    state = StateStore(chain_id=61999, seed="vowmark-registry-tests")
    engine = SimEngine(state)
    engine.activate()
    try:
        registry_address, _ = engine.deploy(REGISTRY_CODE, args=[ZERO], sender=DEPLOYER)
        vault_address, _ = engine.deploy(VAULT_CODE, args=[registry_address], sender=DEPLOYER)
        engine.call_method(registry_address, "set_vault_address", [vault_address], sender=DEPLOYER)
        yield engine, registry_address, vault_address
    finally:
        engine.deactivate()
        loader._mock_embeddings_for_direct_mode = original_embedding_patch


def _issue(engine, vault_address: str, *, statement: str = "A commitment with frozen evidence") -> int:
    created = "2030-01-01T00:00:00Z"
    maturity = "2030-01-02T00:00:00Z"
    deadline = "2030-01-03T00:00:00Z"
    _warp(engine, created)
    engine.vm.value = 100
    result = engine.call_method(
        vault_address,
        "create_commitment",
        [
            statement,
            "Fulfilled means the frozen evidence contains the required record.",
            _timestamp(maturity),
            _timestamp(deadline),
            REMEDY,
            ["https://example.com/vowmark-proof"],
            ["PUBLICATION"],
            ["immutable test evidence"],
        ],
        sender=ISSUER,
    )
    # A finalized post-message is delivered on the next top-level call in
    # the simulator, matching GenLayer's next-block delivery model.
    engine.call_method(vault_address, "get_issuance", [result], sender=ISSUER)
    return int(result)


def _mock_review_evidence(engine: SimEngine, body: str) -> None:
    engine.vm.mock_web(re.escape("https://example.com/vowmark-proof"), {"body": body})
    # The simulator auto-parses valid JSON mocks; the contract intentionally
    # accepts a fenced response and parses it itself.
    engine.vm.mock_llm(".*", '```json\n{"verdict":"INCONCLUSIVE"}\n```')


def test_unrelated_reviewer_is_not_blocked_by_another_reviewer(deployed):
    engine, registry_address, vault_address = deployed
    commitment_id = _issue(engine, vault_address)
    _warp(engine, "2030-01-02T01:00:00Z")

    _mock_review_evidence(engine, "snapshot from reviewer A")
    engine.call_method(registry_address, "review_commitment", [commitment_id], sender=REVIEWER_A)

    # A previously global cooldown would reject this call. A different
    # reviewer must be able to submit a changed snapshot immediately.
    engine.vm.clear_mocks()
    _mock_review_evidence(engine, "snapshot from reviewer B")
    engine.call_method(registry_address, "review_commitment", [commitment_id], sender=REVIEWER_B)
    reviews = engine.call_method(registry_address, "get_reviews", [commitment_id], sender=REVIEWER_B)
    assert len(reviews) == 2
    assert reviews[0]["requested_by"].lower() == REVIEWER_A
    assert reviews[1]["requested_by"].lower() == REVIEWER_B

    _mock_review_evidence(engine, "snapshot from reviewer A again")
    with pytest.raises(Exception, match="reviewer retry cooldown is active"):
        engine.call_method(registry_address, "review_commitment", [commitment_id], sender=REVIEWER_A)


def test_identical_snapshot_is_rejected_even_for_a_new_reviewer(deployed):
    engine, registry_address, vault_address = deployed
    commitment_id = _issue(engine, vault_address, statement="A second commitment with frozen evidence")
    _warp(engine, "2030-01-02T01:00:00Z")
    _mock_review_evidence(engine, "one immutable snapshot")
    engine.call_method(registry_address, "review_commitment", [commitment_id], sender=REVIEWER_A)

    _mock_review_evidence(engine, "one immutable snapshot")
    with pytest.raises(Exception, match="identical evidence snapshot was already reviewed"):
        engine.call_method(registry_address, "review_commitment", [commitment_id], sender=REVIEWER_C)


def test_duplicate_registration_requires_identical_anchors(deployed):
    engine, registry_address, vault_address = deployed
    commitment_id = _issue(engine, vault_address, statement="A registration identity check")
    args = [
        commitment_id,
        ISSUER,
        "A registration identity check",
        "Fulfilled means the frozen evidence contains the required record.",
        _timestamp("2030-01-01T00:00:00Z"),
        _timestamp("2030-01-02T00:00:00Z"),
        _timestamp("2030-01-03T00:00:00Z"),
        REMEDY,
        100,
        ["https://example.com/vowmark-proof"],
        ["PUBLICATION"],
        ["immutable test evidence"],
    ]
    # Exact replay is idempotent.
    engine.call_method(registry_address, "register_commitment", args, sender=vault_address)

    conflicting = list(args)
    conflicting[9] = ["https://example.com/another-proof"]
    with pytest.raises(Exception, match="commitment registration conflicts with existing record"):
        engine.call_method(registry_address, "register_commitment", conflicting, sender=vault_address)


def test_terminal_settlement_and_reconciliation_are_idempotent(deployed):
    engine, registry_address, vault_address = deployed
    commitment_id = _issue(engine, vault_address, statement="A terminal settlement check")
    _warp(engine, "2030-01-02T01:00:00Z")
    _mock_review_evidence(engine, "terminal snapshot")
    engine.vm.clear_mocks()
    # No usable evidence is intentionally inconclusive; the expiry path is
    # exercised after the real final review deadline.
    _warp(engine, "2030-01-03T00:00:01Z")
    engine.call_method(registry_address, "expire_commitment", [commitment_id], sender=REVIEWER_B)
    engine.call_method(vault_address, "get_issuance", [commitment_id], sender=ISSUER)
    assert engine.call_method(vault_address, "get_settled", [commitment_id], sender=ISSUER) is True
    pending = engine.call_method(registry_address, "get_settlement", [commitment_id], sender=REVIEWER_B)
    assert pending["state"] == "SETTLEMENT_PENDING"
    credit_after_vault_settlement = engine.call_method(vault_address, "get_credit", [ISSUER], sender=ISSUER)

    # Case A: Vault credit exists while Registry's settlement callback is
    # still pending. Reconciliation should only advance Registry state.
    engine.call_method(registry_address, "reconcile_settlement", [commitment_id], sender=REVIEWER_B)
    settlement = engine.call_method(registry_address, "get_settlement", [commitment_id], sender=REVIEWER_B)
    assert settlement["state"] == "CREDIT_CONFIRMED"
    assert engine.call_method(vault_address, "get_credit", [ISSUER], sender=ISSUER) == credit_after_vault_settlement

    # Case B: retrying after completion must not emit another settlement or
    # duplicate the issuer's credit.
    engine.call_method(registry_address, "retry_settlement", [commitment_id], sender=REVIEWER_B)
    engine.call_method(registry_address, "reconcile_settlement", [commitment_id], sender=REVIEWER_B)
    assert engine.call_method(vault_address, "get_credit", [ISSUER], sender=ISSUER) == credit_after_vault_settlement


def test_retry_registration_is_immutable_and_does_not_duplicate_bond(deployed):
    engine, registry_address, vault_address = deployed
    commitment_id = _issue(engine, vault_address, statement="A registration recovery replay")

    before = engine.call_method(vault_address, "get_issuance", [commitment_id], sender=ISSUER)
    before_commitment = engine.call_method(registry_address, "get_commitment", [commitment_id], sender=ISSUER)
    before_total = engine.call_method(registry_address, "get_total_commitments", [], sender=ISSUER)

    # genlayer-test delivers the initial registration child before the next
    # top-level call, so it cannot suppress that child to reproduce a missing
    # initial callback. This deterministic path still verifies that the
    # public recovery entrypoint is safe to replay after registration.
    engine.call_method(vault_address, "retry_registration", [commitment_id], sender=ISSUER)
    after = engine.call_method(vault_address, "get_issuance", [commitment_id], sender=ISSUER)
    after_commitment = engine.call_method(registry_address, "get_commitment", [commitment_id], sender=ISSUER)

    assert before["registered"] is True
    assert after == before
    assert after_commitment == before_commitment
    assert engine.call_method(registry_address, "get_total_commitments", [], sender=ISSUER) == before_total == 1
