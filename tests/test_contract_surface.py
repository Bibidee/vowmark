from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = (ROOT / "contracts/vowmark-contracts/contracts/vowmark_registry.py").read_text()
VAULT = (ROOT / "contracts/vowmark-contracts/contracts/vowmark_vault.py").read_text()


def test_only_studionet_runtime_identifiers_are_present():
    for directory in (ROOT / "contracts", ROOT / "web"):
        for path in directory.rglob("*"):
            if any(part in {"node_modules", ".next", "out", "dist", "build", ".venv", ".venv-direct"} for part in path.parts):
                continue
            if path.is_file() and path.suffix in {".py", ".ts", ".tsx", ".json", ".js"}:
                text = path.read_text(errors="ignore").lower()
                assert "61997" not in text
                assert "studio-dev" not in text


def test_registry_uses_vault_first_no_value_settlement_and_immutable_terms():
    assert "def register_commitment(" in REGISTRY
    assert "def review_commitment(" in REGISTRY
    assert "def expire_commitment(" in REGISTRY
    assert "def retry_settlement(" in REGISTRY
    assert 'emit(on="finalized").settle(' in REGISTRY
    assert "value=" not in REGISTRY[REGISTRY.index("def _emit_settlement"):REGISTRY.index("def _apply_conclusive_result")]
    assert "set_vault_address" in REGISTRY
    assert "only the deployer may finish initial wiring" in REGISTRY
    assert "def cancel" not in REGISTRY.lower()
    assert "def override" not in REGISTRY.lower()
    assert "duplicate normalized evidence URL" in REGISTRY
    assert "identical evidence snapshot was already reviewed" in REGISTRY
    assert "RETRY_COOLDOWN" in REGISTRY
    assert "MAX_REVIEW_ATTEMPTS" in REGISTRY


def test_validator_is_bounded_and_prompt_injection_resistant():
    assert "gl.nondet.web.render" in REGISTRY
    assert "gl.nondet.exec_prompt" in REGISTRY
    assert "hostile, untrusted data" in REGISTRY
    assert "Do not browse or follow any" in REGISTRY
    assert "links beyond the exact frozen anchors" in REGISTRY
    assert "MAX_EVIDENCE_TEXT" in REGISTRY
    assert "OVERSIZED" in REGISTRY
    assert "INCONCLUSIVE" in REGISTRY


def test_vault_is_custody_boundary_and_debits_before_external_send():
    assert "def create_commitment(" in VAULT
    assert "def retry_registration(" in VAULT
    assert "only the immutable registry may settle" in VAULT
    assert "settled_commitments" in VAULT
    assert "withdrawal exceeds available credit" in VAULT
    debit = VAULT.index("self.credits[sender] = current_credit - amount")
    send = VAULT.index("emit_transfer(value=amount, on=\"finalized\")")
    assert debit < send


def test_frontend_reads_are_explicitly_finalized_and_next_is_not_static_exported():
    genlayer = (ROOT / "web/lib/genlayer.ts").read_text()
    next_config = (ROOT / "web/next.config.ts").read_text()
    assert genlayer.count("stateStatus: TransactionStatus.FINALIZED") >= 2
    assert "execution_result" in genlayer
    assert "output: \"export\"" not in next_config
