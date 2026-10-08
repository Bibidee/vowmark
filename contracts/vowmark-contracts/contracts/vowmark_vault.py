# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from dataclasses import dataclass

from genlayer import *


MAX_STATEMENT = 2_000
MAX_RULE = 3_000
MAX_ANCHORS = 5
MAX_URL = 500
MAX_LABEL = 180
MIN_REVIEW_WINDOW = 15 * 60
MAX_REVIEW_WINDOW = 90 * 24 * 60 * 60

OUTCOME_FULFILLED = "FULFILLED"
OUTCOME_BREACHED = "BREACHED"
OUTCOME_EXPIRED = "EXPIRED_UNRESOLVED"

SETTLEMENT_LOCKED = "LOCKED"
SETTLEMENT_CREDIT_CONFIRMED = "CREDIT_CONFIRMED"

ALLOWED_SOURCE_KINDS = {
    "PUBLICATION",
    "VERSIONED_SOURCE",
    "ONCHAIN_RECORD",
    "THIRD_PARTY_RECORD",
}


@allow_storage
@dataclass
class Issuance:
    commitment_id: u256
    issuer: Address
    remedy: Address
    bond: u256
    statement: str
    verification_rule: str
    created_at: u256
    maturity_at: u256
    final_review_deadline: u256
    registered: bool
    settlement_state: str
    settlement_recipient: Address


@allow_storage
@dataclass
class PendingAnchor:
    url: str
    source_kind: str
    purpose: str


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass


class VowmarkVault(gl.Contract):
    """Finalized-only custody, registration recovery and withdrawals.

    Bonds enter this contract at issuance. Registry messages never carry
    native value; they only authorize a derived credit. The settlement method
    is idempotent so repeated finalized messages cannot double-credit a bond.
    """

    registry_address: Address
    next_commitment_id: u256
    issuances: TreeMap[u256, Issuance]
    issuance_evidence: TreeMap[u256, TreeMap[u256, PendingAnchor]]
    credits: TreeMap[Address, u256]
    settled_commitments: TreeMap[u256, bool]

    def __init__(self, registry_address: str):
        self.registry_address = self._address_arg(registry_address)
        self._require_nonzero_address(self.registry_address, "registry address")
        self.next_commitment_id = u256(0)

    def _address_arg(self, value):
        if isinstance(value, Address):
            return value
        return Address(value)

    def _address_text(self, address: Address) -> str:
        # Older Direct Mode runtimes expose Address-like values as strings;
        # current deployments expose the Address object with ``as_hex``.
        # Keeping this boundary tolerant lets the same contract source be
        # exercised by both supported runtimes.
        if isinstance(address, str):
            return address.lower()
        return address.as_hex.lower()

    def _require_nonzero_address(self, address: Address, label: str) -> None:
        if self._address_text(address) == "0x" + ("0" * 40):
            raise gl.vm.UserError(label + " must be nonzero")

    def _direct_eoa_sender(self) -> Address:
        sender = self._address_arg(gl.message.sender_address)
        origin = self._address_arg(gl.message.origin_address)
        if self._address_text(sender) != self._address_text(origin):
            raise gl.vm.UserError("withdrawal requires a direct EOA caller")
        return sender

    def _now(self) -> u256:
        raw_datetime = gl.message_raw["datetime"]
        from datetime import datetime

        return u256(int(datetime.fromisoformat(raw_datetime.replace("Z", "+00:00")).timestamp()))

    def _normalize_url(self, url: str) -> str:
        value = url.strip()
        if len(value) == 0 or len(value) > MAX_URL:
            raise gl.vm.UserError("evidence URL length is invalid")
        if not value.startswith("https://"):
            raise gl.vm.UserError("evidence URL must use HTTPS")
        if "@" in value or "\\" in value or "\x00" in value:
            raise gl.vm.UserError("evidence URL contains a forbidden form")
        authority_and_path = value[8:]
        if "/" in authority_and_path:
            authority, path = authority_and_path.split("/", 1)
            path = "/" + path
        else:
            authority = authority_and_path
            path = ""
        if len(authority) == 0 or authority.startswith("."):
            raise gl.vm.UserError("evidence URL host is invalid")
        host = authority.split(":", 1)[0].lower()
        blocked_prefixes = ("127.", "10.", "192.168.", "169.254.", "0.")
        if host in {"localhost", "::1", "[::1]", "0.0.0.0"} or host.endswith(".local") or host.endswith(".internal") or host.startswith(blocked_prefixes):
            raise gl.vm.UserError("evidence URL host is not public")
        if host.startswith("172."):
            second_octet = host.split(".")[1] if "." in host else ""
            if second_octet.isdigit() and 16 <= int(second_octet) <= 31:
                raise gl.vm.UserError("evidence URL host is private")
        if "." not in host and host != "[::1]":
            raise gl.vm.UserError("evidence URL must use a public hostname")
        return "https://" + authority.lower() + path

    def _validate_terms(self, issuer: Address, remedy: Address, statement: str, verification_rule: str, maturity_at: u256, final_review_deadline: u256, urls, source_kinds, purposes) -> list[PendingAnchor]:
        if len(statement.strip()) == 0 or len(statement) > MAX_STATEMENT:
            raise gl.vm.UserError("commitment statement length is invalid")
        if len(verification_rule.strip()) == 0 or len(verification_rule) > MAX_RULE:
            raise gl.vm.UserError("verification rule length is invalid")
        self._require_nonzero_address(issuer, "issuer address")
        self._require_nonzero_address(remedy, "remedy address")
        if self._address_text(issuer) == self._address_text(remedy):
            raise gl.vm.UserError("remedy address must differ from issuer")
        now = self._now()
        if maturity_at <= now:
            raise gl.vm.UserError("maturity must be in the future")
        if final_review_deadline <= maturity_at:
            raise gl.vm.UserError("final review deadline must be after maturity")
        review_window = final_review_deadline - maturity_at
        if review_window < u256(MIN_REVIEW_WINDOW) or review_window > u256(MAX_REVIEW_WINDOW):
            raise gl.vm.UserError("review window is outside the allowed bounds")
        if not (1 <= len(urls) <= MAX_ANCHORS) or len(urls) != len(source_kinds) or len(urls) != len(purposes):
            raise gl.vm.UserError("evidence anchor fields are invalid")
        anchors = []
        seen = []
        for index in range(len(urls)):
            normalized = self._normalize_url(urls[index])
            kind = source_kinds[index].strip().upper()
            purpose = purposes[index].strip()
            if kind not in ALLOWED_SOURCE_KINDS:
                raise gl.vm.UserError("unsupported evidence source kind")
            if len(purpose) == 0 or len(purpose) > MAX_LABEL:
                raise gl.vm.UserError("evidence purpose label length is invalid")
            if normalized in seen:
                raise gl.vm.UserError("duplicate normalized evidence URL")
            seen.append(normalized)
            anchors.append(PendingAnchor(url=urls[index].strip(), source_kind=kind, purpose=purpose))
        return anchors

    def _registration_args(self, issuance: Issuance):
        anchor_map = self.issuance_evidence[issuance.commitment_id]
        urls = []
        source_kinds = []
        purposes = []
        for index in range(MAX_ANCHORS):
            key = u256(index)
            if key in anchor_map:
                anchor = anchor_map[key]
                urls.append(anchor.url)
                source_kinds.append(anchor.source_kind)
                purposes.append(anchor.purpose)
        return urls, source_kinds, purposes

    def _emit_registration(self, issuance: Issuance) -> None:
        urls, source_kinds, purposes = self._registration_args(issuance)
        gl.get_contract_at(self.registry_address).emit(on="finalized").register_commitment(
            issuance.commitment_id,
            self._address_text(issuance.issuer),
            issuance.statement,
            issuance.verification_rule,
            issuance.created_at,
            issuance.maturity_at,
            issuance.final_review_deadline,
            self._address_text(issuance.remedy),
            issuance.bond,
            urls,
            source_kinds,
            purposes,
        )

    @gl.public.write.payable
    def create_commitment(self, statement: str, verification_rule: str, maturity_at: u256, final_review_deadline: u256, remedy_address: str, anchor_urls: list[str], anchor_source_kinds: list[str], anchor_purposes: list[str]) -> u256:
        if gl.message.value == u256(0):
            raise gl.vm.UserError("bond must be greater than zero")
        issuer = self._address_arg(gl.message.sender_address)
        remedy = self._address_arg(remedy_address)
        anchors = self._validate_terms(issuer, remedy, statement, verification_rule, maturity_at, final_review_deadline, anchor_urls, anchor_source_kinds, anchor_purposes)
        created_at = self._now()
        commitment_id = self.next_commitment_id
        self.next_commitment_id += u256(1)
        issuance = Issuance(
            commitment_id=commitment_id,
            issuer=issuer,
            remedy=remedy,
            bond=gl.message.value,
            statement=statement.strip(),
            verification_rule=verification_rule.strip(),
            created_at=created_at,
            maturity_at=maturity_at,
            final_review_deadline=final_review_deadline,
            registered=False,
            settlement_state=SETTLEMENT_LOCKED,
            settlement_recipient=Address("0x" + ("0" * 40)),
        )
        self.issuances[commitment_id] = issuance
        anchor_map = self.issuance_evidence.get_or_insert_default(commitment_id)
        for index in range(len(anchors)):
            anchor_map[u256(index)] = anchors[index]
        self._emit_registration(issuance)
        return commitment_id

    @gl.public.write
    def retry_registration(self, commitment_id: u256) -> None:
        if commitment_id not in self.issuances:
            raise gl.vm.UserError("issuance does not exist")
        issuance = self.issuances[commitment_id]
        if not issuance.registered:
            self._emit_registration(issuance)

    @gl.public.write
    def confirm_registration(self, commitment_id: u256) -> None:
        if self._address_text(gl.message.sender_address) != self._address_text(self.registry_address):
            raise gl.vm.UserError("only the immutable registry may confirm registration")
        if commitment_id not in self.issuances:
            raise gl.vm.UserError("issuance does not exist")
        self.issuances[commitment_id].registered = True

    @gl.public.write
    def settle(self, commitment_id: u256, outcome: str) -> None:
        if self._address_text(gl.message.sender_address) != self._address_text(self.registry_address):
            raise gl.vm.UserError("only the immutable registry may settle")
        if commitment_id not in self.issuances:
            raise gl.vm.UserError("issuance does not exist")
        issuance = self.issuances[commitment_id]
        if not issuance.registered:
            raise gl.vm.UserError("issuance is not registered")
        if outcome not in {OUTCOME_FULFILLED, OUTCOME_BREACHED, OUTCOME_EXPIRED}:
            raise gl.vm.UserError("invalid terminal outcome")
        if commitment_id in self.settled_commitments:
            # Retryable child messages are deliberately idempotent.
            return
        recipient = issuance.remedy if outcome == OUTCOME_BREACHED else issuance.issuer
        self._require_nonzero_address(recipient, "settlement recipient")
        self.settled_commitments[commitment_id] = True
        issuance.settlement_state = SETTLEMENT_CREDIT_CONFIRMED
        issuance.settlement_recipient = recipient
        self.credits[recipient] = self.credits.get(recipient, u256(0)) + issuance.bond

    @gl.public.write
    def withdraw(self, amount: u256) -> None:
        sender = self._direct_eoa_sender()
        if amount == u256(0):
            raise gl.vm.UserError("withdrawal amount must be greater than zero")
        current_credit = self.credits.get(sender, u256(0))
        if amount > current_credit:
            raise gl.vm.UserError("withdrawal exceeds available credit")
        # Debit before the finalized external send. A failed user withdrawal
        # cannot be replayed by submitting the same amount twice.
        self.credits[sender] = current_credit - amount
        _Recipient(sender).emit_transfer(value=amount, on="finalized")

    @gl.public.view
    def get_withdrawal_policy(self) -> dict:
        return {
            "supported_caller": "direct EOA",
            "requires_sender_equals_origin": True,
            "delivery": "external finalized transfer",
            "debit_order": "before transfer",
        }

    @gl.public.view
    def get_credit(self, wallet_address: str) -> u256:
        return self.credits.get(self._address_arg(wallet_address), u256(0))

    @gl.public.view
    def get_registry(self) -> str:
        return self._address_text(self.registry_address)

    @gl.public.view
    def get_next_commitment_id(self) -> u256:
        return self.next_commitment_id

    @gl.public.view
    def get_issuance(self, commitment_id: u256) -> dict:
        if commitment_id not in self.issuances:
            raise gl.vm.UserError("issuance does not exist")
        issuance = self.issuances[commitment_id]
        return {
            "commitment_id": issuance.commitment_id,
            "issuer": self._address_text(issuance.issuer),
            "remedy": self._address_text(issuance.remedy),
            "bond": issuance.bond,
            "statement": issuance.statement,
            "verification_rule": issuance.verification_rule,
            "created_at": issuance.created_at,
            "maturity_at": issuance.maturity_at,
            "final_review_deadline": issuance.final_review_deadline,
            "registered": issuance.registered,
            "settlement_state": issuance.settlement_state,
            "settlement_recipient": self._address_text(issuance.settlement_recipient),
        }

    @gl.public.view
    def get_settlement(self, commitment_id: u256) -> dict:
        if commitment_id not in self.issuances:
            raise gl.vm.UserError("issuance does not exist")
        issuance = self.issuances[commitment_id]
        return {
            "state": issuance.settlement_state,
            "recipient": self._address_text(issuance.settlement_recipient),
            "amount": issuance.bond,
            "settled": commitment_id in self.settled_commitments,
        }

    @gl.public.view
    def get_settled(self, commitment_id: u256) -> bool:
        return commitment_id in self.settled_commitments
