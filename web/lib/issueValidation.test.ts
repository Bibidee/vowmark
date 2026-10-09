import assert from "node:assert/strict";
import { validateEvidenceDraft } from "./issueValidation";

const anchor = (url: string, sourceKind = "PUBLICATION") => ({ url, sourceKind, purpose: "public proof" });
for (const url of [
  "https://127.1/evidence", "https://0x7f.1/evidence", "https://127.0.0.1/evidence",
  "https://example.invalid/proof", "https://localhost/proof", "https://user:pass@example.com/proof",
  "https://%65xample.com/proof", "https://example.com:8443/proof", "https://example.com./proof", "http://example.com/proof",
]) assert.throws(() => validateEvidenceDraft([anchor(url)]), /./, url);
assert.doesNotThrow(() => validateEvidenceDraft([anchor("https://example.com/vowmark-inconclusive-proof-2026-10-09")]));
assert.doesNotThrow(() => validateEvidenceDraft([anchor("https://raw.githubusercontent.com/Bibidee/vowmark/ce9121035c3bb7defae49abed8f0e487aa34ab3d/evidence/fulfilled-proof-fixture.txt", "VERSIONED_SOURCE")]));
assert.throws(() => validateEvidenceDraft([anchor("https://raw.githubusercontent.com/Bibidee/vowmark/main/evidence/proof.txt", "VERSIONED_SOURCE")]));
assert.throws(() => validateEvidenceDraft([anchor("https://example.com/path"), anchor("https://example.com:443/path")]));
console.log("Issue evidence preflight checks passed");
