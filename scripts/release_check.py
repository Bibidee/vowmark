#!/usr/bin/env python3
"""Lightweight repository guard for VOWMARK.

This is not a substitute for contract tests or a security audit. It catches a few
release-blocking contamination classes in source/config files.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SCAN_DIRS = [ROOT / "contracts", ROOT / "web"]
SOURCE_SUFFIXES = {".py", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"}
FORBIDDEN = {
    "61997": "Studio-dev chain ID must not appear in runtime source/config",
    "studio-dev": "Studio-dev must not appear in runtime source/config",
    "supabase": "No application backend/database dependency",
    "firebase": "No application backend/database dependency",
    "prisma": "No server database ORM",
    "mongodb": "No application database",
}

failures = []
for directory in SCAN_DIRS:
    if not directory.exists():
        continue
    for path in directory.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in SOURCE_SUFFIXES:
            continue
        if any(part in {"node_modules", ".next", "dist", "build"} for part in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore").lower()
        except OSError:
            continue
        for needle, reason in FORBIDDEN.items():
            if needle in text:
                failures.append(f"{path.relative_to(ROOT)}: {reason} ({needle})")

if failures:
    print("VOWMARK release guard FAILED")
    for item in failures:
        print(" -", item)
    sys.exit(1)

print("VOWMARK release guard passed")
