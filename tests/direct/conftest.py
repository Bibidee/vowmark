"""Test-runner compatibility fixes for GenLayer Direct Mode on Windows.

genlayer-test 0.29.2 replaces fd 0 with a ``mkstemp`` file while importing a
contract. Its Linux cleanup unlinks the path while fd 0 is still open, which
is rejected by Windows. Keep the path until the Direct Mode VM restores the
original stdin descriptor.
"""

from __future__ import annotations

import os
import sys
import tempfile


def _install_windows_stdin_patch() -> None:
    if sys.platform != "win32":
        return

    try:
        from gltest.direct import loader
        from gltest.direct.vm import VMContext
    except ModuleNotFoundError:
        # The regular Python test environment intentionally does not install
        # the Direct Mode plugin; pytest will skip those tests instead.
        return

    if getattr(loader, "_vowmark_windows_stdin_patch", False):
        return

    def inject_message_to_fd0(vm) -> None:
        from genlayer.py import calldata
        from genlayer.py.types import Address

        sender_addr = vm.sender
        if isinstance(sender_addr, bytes):
            sender_addr = Address(sender_addr)
        contract_addr = vm._contract_address
        if isinstance(contract_addr, bytes):
            contract_addr = Address(contract_addr)
        origin_addr = vm.origin
        if isinstance(origin_addr, bytes):
            origin_addr = Address(origin_addr)

        message_data = {
            "contract_address": contract_addr,
            "sender_address": sender_addr,
            "origin_address": origin_addr,
            "stack": [],
            "value": vm._value,
            "datetime": vm._datetime,
            "is_init": False,
            "chain_id": vm._chain_id,
            "entry_kind": 0,
            "entry_data": b"",
            "entry_stage_data": None,
        }
        encoded = calldata.encode(message_data)
        fd, path = tempfile.mkstemp()
        try:
            os.write(fd, encoded)
            os.lseek(fd, 0, os.SEEK_SET)
            vm._original_stdin_fd = os.dup(0)
            os.dup2(fd, 0)
            vm._vowmark_stdin_path = path
        except Exception:
            os.close(fd)
            os.unlink(path)
            raise
        else:
            os.close(fd)

    original_cleanup = VMContext._cleanup_after_deactivate

    def cleanup_after_deactivate(vm) -> None:
        path = getattr(vm, "_vowmark_stdin_path", None)
        try:
            original_cleanup(vm)
        finally:
            if path:
                try:
                    os.unlink(path)
                except FileNotFoundError:
                    pass
                vm._vowmark_stdin_path = None

    loader._inject_message_to_fd0 = inject_message_to_fd0
    VMContext._cleanup_after_deactivate = cleanup_after_deactivate
    loader._vowmark_windows_stdin_patch = True


_install_windows_stdin_patch()
