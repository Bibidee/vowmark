from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = (ROOT / "contracts/vowmark-contracts/contracts/vowmark_registry.py").read_text()
VAULT = (ROOT / "contracts/vowmark-contracts/contracts/vowmark_vault.py").read_text()


def test_only_studionet_runtime_identifiers_are_present():
    for directory in (ROOT / "contracts", ROOT / "web"):
        for path in directory.rglob("*"):
            if any(part in {"node_modules", ".next", "dist", "build", ".venv"} for part in path.parts):
                continue
            if path.is_file() and path.suffix in {".py", ".ts", ".tsx", ".json", ".js"}:
                text = path.read_text(errors="ignore").lower()
                assert "61997" not in text
                assert "studio-dev" not in text


def test_registry_freezes_terms_and_has_no_admin_override():
    assert "@gl.public.write.payable" in REGISTRY
    assert "def create_commitment(" in REGISTRY
    assert "def review_commitment(" in REGISTRY
    assert "def expire_commitment(" in REGISTRY
    assert "set_vault_address" in REGISTRY
    assert "only the deployer may finish initial wiring" in REGISTRY
    assert "def cancel" not in REGISTRY.lower()
    assert "def override" not in REGISTRY.lower()
    assert "remedy_address" in REGISTRY
    assert "duplicate normalized evidence URL" in REGISTRY
    assert "identical evidence snapshot was already reviewed" in REGISTRY


def test_validator_is_bounded_and_prompt_injection_resistant():
    assert "gl.nondet.web.render" in REGISTRY or "gl.get_webpage" in REGISTRY
    assert "gl.nondet.exec_prompt" in REGISTRY or "gl.exec_prompt" in REGISTRY
    assert "hostile, untrusted data" in REGISTRY
    assert "Do not browse or follow any" in REGISTRY
    assert "links beyond the exact frozen anchors" in REGISTRY
    assert "MAX_EVIDENCE_TEXT" in REGISTRY
    assert "OVERSIZED" in REGISTRY
    assert "INCONCLUSIVE" in REGISTRY


def test_vault_is_registry_only_and_debits_before_send():
    assert "only the immutable registry may settle" in VAULT
    assert "settled_commitments" in VAULT
    assert "withdrawal exceeds available credit" in VAULT
    debit = VAULT.index("self.credits[sender] = current_credit - amount")
    send = VAULT.index("emit_transfer(value=amount)")
    assert debit < send
