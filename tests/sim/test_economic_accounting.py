"""Multi-commitment custody and accounting checks for the VOWMARK simulator."""

from __future__ import annotations

from datetime import datetime
import os
import re

import pytest

from tests.direct import conftest as _direct_compat  # noqa: F401
pytest.importorskip("glsim", reason="simulator behavior tests run in the simulator-registry CI job")
from glsim.engine import SimEngine
from glsim.state import StateStore


REGISTRY_CODE = os.environ.get("VOWMARK_REGISTRY_CODE", "contracts/vowmark-contracts/contracts/vowmark_registry.py")
VAULT_CODE = os.environ.get("VOWMARK_VAULT_CODE", "contracts/vowmark-contracts/contracts/vowmark_vault.py")
DEPLOYER = "0x" + ("aa" * 20)
ISSUER_A = "0x" + ("11" * 20)
ISSUER_B = "0x" + ("33" * 20)
ISSUER_C = "0x" + ("44" * 20)
REMEDY_A = "0x" + ("22" * 20)
REMEDY_B = "0x" + ("55" * 20)
REMEDY_C = "0x" + ("66" * 20)
UNRELATED = "0x" + ("77" * 20)
ZERO = "0x" + ("00" * 20)


def _timestamp(iso_value: str) -> int:
    return int(datetime.fromisoformat(iso_value.replace("Z", "+00:00")).timestamp())


def _warp(engine: SimEngine, iso_value: str) -> None:
    engine.vm.warp(iso_value)
    import genlayer.gl as gl

    gl.message_raw["datetime"] = iso_value


@pytest.fixture
def deployed():
    import gltest.direct.loader as loader

    original_embedding_patch = loader._mock_embeddings_for_direct_mode
    loader._mock_embeddings_for_direct_mode = lambda: None
    state = StateStore(chain_id=61999, seed="vowmark-economic-conservation-tests")
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


def _create_commitment(
    engine: SimEngine,
    vault_address: str,
    *,
    issuer: str,
    remedy: str,
    value: int,
    label: str,
    url: str,
) -> int:
    _warp(engine, "2030-01-01T00:00:00Z")
    engine.vm.value = value
    result = engine.call_method(
        vault_address,
        "create_commitment",
        [
            f"Economic conservation / {label}",
            "Fulfilled means the frozen evidence contains the required record.",
            _timestamp("2030-01-02T00:00:00Z"),
            _timestamp("2030-01-03T00:00:00Z"),
            remedy,
            [url],
            ["PUBLICATION"],
            [f"evidence for {label}"],
        ],
        sender=issuer,
    )
    engine.call_method(vault_address, "get_issuance", [result], sender=issuer)
    return int(result)


def _review(engine: SimEngine, registry_address: str, commitment_id: int, url: str, verdict: str, reviewer: str) -> None:
    engine.vm.clear_mocks()
    engine.vm.mock_web(re.escape(url), {"body": f"deterministic evidence for {commitment_id}"})
    engine.vm.mock_llm(".*", f'```json\n{{"verdict":"{verdict}"}}\n```')
    engine.call_method(registry_address, "review_commitment", [commitment_id], sender=reviewer)


def test_multiple_commitments_conserve_internal_custody_and_allow_partial_withdrawals(deployed):
    engine, registry_address, vault_address = deployed
    active_url = "https://example.com/economic-active"
    fulfilled_url = "https://example.com/economic-fulfilled"
    breached_url = "https://example.com/economic-breached"
    inconclusive_url = "https://example.com/economic-inconclusive"
    expired_url = "https://example.com/economic-expired"

    active_id = _create_commitment(engine, vault_address, issuer=ISSUER_A, remedy=REMEDY_A, value=100, label="active", url=active_url)
    fulfilled_id = _create_commitment(engine, vault_address, issuer=ISSUER_A, remedy=REMEDY_A, value=200, label="fulfilled", url=fulfilled_url)
    breached_id = _create_commitment(engine, vault_address, issuer=ISSUER_B, remedy=REMEDY_B, value=300, label="breached", url=breached_url)
    inconclusive_id = _create_commitment(engine, vault_address, issuer=ISSUER_C, remedy=REMEDY_C, value=400, label="inconclusive", url=inconclusive_url)
    expired_id = _create_commitment(engine, vault_address, issuer=ISSUER_A, remedy=REMEDY_C, value=500, label="expired", url=expired_url)

    _warp(engine, "2030-01-02T00:00:00Z")
    _review(engine, registry_address, fulfilled_id, fulfilled_url, "FULFILLED", "0x" + ("81" * 20))
    engine.call_method(vault_address, "get_issuance", [fulfilled_id], sender=ISSUER_A)
    _review(engine, registry_address, breached_id, breached_url, "BREACHED", "0x" + ("82" * 20))
    engine.call_method(vault_address, "get_issuance", [breached_id], sender=ISSUER_B)
    _review(engine, registry_address, inconclusive_id, inconclusive_url, "INCONCLUSIVE", "0x" + ("83" * 20))

    _warp(engine, "2030-01-03T00:00:00Z")
    engine.call_method(registry_address, "expire_commitment", [expired_id], sender="0x" + ("84" * 20))
    engine.call_method(vault_address, "get_issuance", [expired_id], sender=ISSUER_A)

    assert engine.call_method(registry_address, "get_commitment", [active_id], sender=ISSUER_A)["outcome"] == "OPEN"
    assert engine.call_method(registry_address, "get_commitment", [fulfilled_id], sender=ISSUER_A)["outcome"] == "FULFILLED"
    assert engine.call_method(registry_address, "get_commitment", [breached_id], sender=ISSUER_B)["outcome"] == "BREACHED"
    assert engine.call_method(registry_address, "get_commitment", [inconclusive_id], sender=ISSUER_C)["outcome"] == "OPEN"
    assert engine.call_method(registry_address, "get_commitment", [expired_id], sender=ISSUER_A)["outcome"] == "EXPIRED_UNRESOLVED"

    total_bonds = 100 + 200 + 300 + 400 + 500
    assert engine.call_method(vault_address, "get_credit", [ISSUER_A], sender=ISSUER_A) == 700
    assert engine.call_method(vault_address, "get_credit", [REMEDY_B], sender=ISSUER_B) == 300
    assert engine.call_method(vault_address, "get_credit", [ISSUER_B], sender=ISSUER_B) == 0
    assert engine.call_method(vault_address, "get_credit", [ISSUER_C], sender=ISSUER_C) == 0
    assert engine.call_method(vault_address, "get_credit", [REMEDY_C], sender=ISSUER_C) == 0

    # A repeated settlement request is a no-op and cannot mint a second credit.
    engine.call_method(vault_address, "settle", [fulfilled_id, "FULFILLED"], sender=registry_address)
    assert engine.call_method(vault_address, "get_credit", [ISSUER_A], sender=ISSUER_A) == 700

    engine.call_method(vault_address, "withdraw", [40], sender=ISSUER_A)
    engine.call_method(vault_address, "withdraw", [160], sender=ISSUER_A)
    engine.call_method(vault_address, "withdraw", [100], sender=REMEDY_B)
    assert engine.call_method(vault_address, "get_credit", [ISSUER_A], sender=ISSUER_A) == 500
    assert engine.call_method(vault_address, "get_credit", [REMEDY_B], sender=REMEDY_B) == 200
    with pytest.raises(Exception, match="withdrawal exceeds available credit"):
        engine.call_method(vault_address, "withdraw", [201], sender=REMEDY_B)
    with pytest.raises(Exception, match="withdrawal exceeds available credit"):
        engine.call_method(vault_address, "withdraw", [1], sender=UNRELATED)

    locked = 100 + 400
    outstanding = 500 + 200
    withdrawn = 40 + 160 + 100
    assert total_bonds == locked + outstanding + withdrawn
