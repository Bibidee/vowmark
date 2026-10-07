# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass


class VowmarkVault(gl.Contract):
    """Finalized-only custody, credits, and withdrawals for VOWMARK."""

    registry_address: Address
    credits: TreeMap[Address, u256]
    settled_commitments: TreeMap[u256, bool]

    def __init__(self, registry_address: str):
        self.registry_address = self._address_arg(registry_address)

    def _address_arg(self, value):
        if isinstance(value, Address):
            return value
        return Address(value)

    def _require_nonzero_address(self, address: Address) -> None:
        if address.as_hex.lower() == "0x" + ("0" * 40):
            raise gl.vm.UserError("recipient must be nonzero")

    @gl.public.write.payable
    def settle(self, commitment_id: u256, recipient: str, amount: u256) -> None:
        if gl.message.sender_address != self.registry_address:
            raise gl.vm.UserError("only the immutable registry may settle")
        if commitment_id in self.settled_commitments:
            raise gl.vm.UserError("commitment was already settled")
        if amount == u256(0) or gl.message.value != amount:
            raise gl.vm.UserError("settlement value mismatch")
        recipient_address = self._address_arg(recipient)
        self._require_nonzero_address(recipient_address)
        self.settled_commitments[commitment_id] = True
        self.credits[recipient_address] = (
            self.credits.get(recipient_address, u256(0)) + amount
        )

    @gl.public.write
    def withdraw(self, amount: u256) -> None:
        sender = gl.message.sender_address
        if amount == u256(0):
            raise gl.vm.UserError("withdrawal amount must be greater than zero")
        current_credit = self.credits.get(sender, u256(0))
        if amount > current_credit:
            raise gl.vm.UserError("withdrawal exceeds available credit")
        # Debit before the finalized external send so repeated calls cannot
        # spend the same credit. The recipient is the caller, not model data.
        self.credits[sender] = current_credit - amount
        _Recipient(sender).emit_transfer(value=amount)

    @gl.public.view
    def get_credit(self, wallet_address: str) -> u256:
        return self.credits.get(self._address_arg(wallet_address), u256(0))

    @gl.public.view
    def get_registry(self) -> str:
        return self.registry_address.as_hex

    @gl.public.view
    def get_settled(self, commitment_id: u256) -> bool:
        return commitment_id in self.settled_commitments
