type EvidenceDraft = { url: string; sourceKind: string; purpose: string };

// Browser preflight is deliberately narrower than the contract: the UI only
// accepts ordinary DNS HTTPS origins. It prevents an invalid payable issuance
// from being signed; the Vault remains the authoritative validator.
export function validateEvidenceDraft(anchors: EvidenceDraft[]): void {
  if (anchors.length < 1 || anchors.length > 5) throw new Error("Provide between one and five evidence anchors.");
  const seen = new Set<string>();
  for (const anchor of anchors) {
    const value = anchor.url.trim();
    if (!value || value.length > 500 || /[\x00-\x20\x7f\\]/.test(value)) throw new Error("Use a valid public HTTPS evidence URL of at most 500 characters.");
    if (!/^https:\/\//i.test(value)) throw new Error("Every evidence anchor must use HTTPS.");
    const authority = value.slice(value.indexOf("//") + 2).split(/[/?#]/, 1)[0];
    if (!authority || /[%@\[\]]/.test(authority) || /[^\x21-\x7e]/.test(authority)) throw new Error("Use a public DNS hostname without credentials or an IP address.");
    let parsed: URL;
    try { parsed = new URL(value); } catch { throw new Error("Enter a valid public HTTPS evidence URL."); }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) throw new Error("Use a public HTTPS evidence URL on the standard port, without credentials.");
    if (parsed.hostname.endsWith(".")) throw new Error("Remove the trailing dot from the evidence hostname.");
    const host = parsed.hostname.toLowerCase();
    const labels = host.split(".");
    const suffix = labels.at(-1) || "";
    if (labels.length < 2 || ["localhost", "local", "internal", "home", "lan", "test", "invalid"].includes(suffix)
      || /^\d+$/.test(suffix) || /^0x[0-9a-f]+$/.test(suffix)
      || labels.some((label) => !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) {
      throw new Error("Evidence URLs must use public DNS hostnames; numeric IP aliases and private names are not allowed.");
    }
    if (!anchor.purpose.trim() || anchor.purpose.length > 180) throw new Error("Each evidence anchor needs a purpose of at most 180 characters.");
    if (!["PUBLICATION", "VERSIONED_SOURCE", "ONCHAIN_RECORD", "THIRD_PARTY_RECORD"].includes(anchor.sourceKind)) throw new Error("Choose a supported evidence source type.");
    if (anchor.sourceKind === "VERSIONED_SOURCE") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const revision = host === "raw.githubusercontent.com" && parts.length >= 3 ? parts[2]
        : host === "github.com" && parts.length >= 4 && parts[2] === "blob" ? parts[3] : "";
      if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(revision)) throw new Error("A versioned source must use an immutable GitHub commit URL.");
    }
    if (seen.has(parsed.href)) throw new Error("Evidence URLs must not be duplicated.");
    seen.add(parsed.href);
  }
}
