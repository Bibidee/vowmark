"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { connectWallet, extractExecutionReturn, getWalletState, readVault, waitForFinality, writeVault } from "@/lib/genlayer";
import { formatGen, parseGen } from "@/lib/config";
import { rememberActivity } from "@/lib/activity";
import { asBigInt, type SourceKind } from "@/lib/types";

type Anchor = { url: string; sourceKind: SourceKind; purpose: string };
const initialAnchor: Anchor = { url: "", sourceKind: "PUBLICATION", purpose: "" };

function unix(value: string) { return BigInt(Math.floor(new Date(value).getTime() / 1000)); }
function localValue(secondsFromNow: number) { return new Date(Date.now() + secondsFromNow * 1000).toISOString().slice(0, 16); }

export function IssueForm() {
  const [statement, setStatement] = useState("");
  const [rule, setRule] = useState("");
  const [maturity, setMaturity] = useState(localValue(7 * 24 * 60 * 60));
  const [deadline, setDeadline] = useState(localValue(14 * 24 * 60 * 60));
  const [remedy, setRemedy] = useState("");
  const [bond, setBond] = useState("1");
  const [anchors, setAnchors] = useState<Anchor[]>([initialAnchor]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [commitmentId, setCommitmentId] = useState("");
  const [finalized, setFinalized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const maturitySeconds = useMemo(() => maturity ? unix(maturity) : 0n, [maturity]);
  const deadlineSeconds = useMemo(() => deadline ? unix(deadline) : 0n, [deadline]);

  function updateAnchor(index: number, patch: Partial<Anchor>) {
    setAnchors((items) => items.map((item, current) => current === index ? { ...item, ...patch } : item));
  }

  function validate() {
    if (statement.trim().length < 10) throw new Error("Write a specific commitment statement.");
    if (rule.trim().length < 10) throw new Error("Describe how validators can decide the promise.");
    if (maturitySeconds <= BigInt(Math.floor(Date.now() / 1000))) throw new Error("Maturity must be in the future.");
    if (deadlineSeconds <= maturitySeconds) throw new Error("The final review deadline must be after maturity.");
    if (deadlineSeconds - maturitySeconds < 2n * 60n * 60n) throw new Error("The review window must be at least two hours.");
    if (!/^0x[0-9a-fA-F]{40}$/.test(remedy) || /^0x0{40}$/i.test(remedy)) throw new Error("Enter a valid nonzero remedy address.");
    if (anchors.some((item) => !item.url.startsWith("https://") || !item.purpose.trim())) throw new Error("Every evidence anchor needs an HTTPS URL and purpose.");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setSubmitted(""); setCommitmentId(""); setFinalized(false); setSubmitting(true);
    try {
      validate();
      let wallet = await getWalletState().catch(() => null);
      if (!wallet?.address) wallet = await connectWallet();
      if (!wallet.isCorrectNetwork) throw new Error("Switch your wallet to GenLayer Studionet before signing.");
      const hash = await writeVault(wallet.address, "create_commitment", [statement, rule, maturitySeconds, deadlineSeconds, remedy, anchors.map((item) => item.url), anchors.map((item) => item.sourceKind), anchors.map((item) => item.purpose)], parseGen(bond));
      const txHash = String(hash);
      setSubmitted(txHash);
      const receipt = await waitForFinality(txHash);
      const actualId = extractExecutionReturn(receipt);
      if (actualId === undefined || actualId < 0n) throw new Error("Finalized issuance did not return a canonical commitment id.");
      const issuance = await readVault("get_issuance", [actualId]) as Record<string, unknown>;
      const sameAddress = (left: unknown, right: string) => typeof left === "string" && left.toLowerCase() === right.toLowerCase();
      if (
        asBigInt(issuance.commitment_id) !== actualId
        || !sameAddress(issuance.issuer, wallet.address)
        || !sameAddress(issuance.remedy, remedy)
        || issuance.statement !== statement.trim()
        || issuance.verification_rule !== rule.trim()
        || asBigInt(issuance.maturity_at) !== maturitySeconds
        || asBigInt(issuance.final_review_deadline) !== deadlineSeconds
        || asBigInt(issuance.bond) !== parseGen(bond)
      ) throw new Error("Finalized Vault issuance did not match the signed commitment terms.");
      rememberActivity({ hash: txHash, kind: "issue", label: "Issue commitment", commitmentId: actualId.toString(), createdAt: new Date().toISOString() });
      setCommitmentId(actualId.toString());
      setFinalized(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The commitment could not be submitted.");
    } finally { setSubmitting(false); }
  }

  return <div className="page form-page"><div className="form-intro"><p className="eyebrow">Issue / freeze the terms</p><h1>A promise with a fixed shape.</h1><p className="lede">Your signature locks the statement, verification rule, deadline, remedy address, evidence policy and bond together. The Vault receives the bond first; the Registry records the commitment through a finalized no-value message.</p></div><form className="form-layout" onSubmit={submit}><div><section className="form-section"><h2>01 / The promise</h2><div className="field"><label htmlFor="statement">Commitment statement</label><textarea id="statement" value={statement} onChange={(event) => setStatement(event.target.value)} placeholder="By the maturity date, I will…" maxLength={2000} required /><span className="hint">State one externally verifiable outcome. Avoid subjective words like “excellent” or “satisfactory.”</span></div><div className="field"><label htmlFor="rule">Verification rule</label><textarea id="rule" value={rule} onChange={(event) => setRule(event.target.value)} placeholder="Fulfilled means the frozen evidence shows…" maxLength={3000} required /><span className="hint">Explain what the frozen public evidence must establish, including how the deadline matters.</span></div></section><section className="form-section"><h2>02 / The clock and remedy</h2><div className="field-row"><div className="field"><label htmlFor="maturity">Maturity</label><input id="maturity" type="datetime-local" value={maturity} onChange={(event) => setMaturity(event.target.value)} required /></div><div className="field"><label htmlFor="deadline">Final review deadline</label><input id="deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} required /></div></div><div className="field"><label htmlFor="remedy">Remedy address</label><input id="remedy" value={remedy} onChange={(event) => setRemedy(event.target.value)} placeholder="0x…" spellCheck={false} required /><span className="hint">A nonzero address different from yours. This is immutable and receives the bond only if validators conclude BREACHED.</span></div><div className="field"><label htmlFor="bond">Bond (GEN)</label><input id="bond" inputMode="decimal" value={bond} onChange={(event) => setBond(event.target.value)} placeholder="1" required /><span className="hint">The bond is held by the Vault from issuance and can only leave through an evidenced terminal outcome or withdrawal.</span></div></section><section className="form-section"><h2>03 / Frozen evidence anchors</h2><p className="hint" style={{ marginBottom: 16 }}>Validators fetch only these exact HTTPS URLs. Do not include private links, credentials, or a source that needs a reviewer-authored explanation.</p>{anchors.map((anchor, index) => <div className="anchor-row" key={index}><div className="field"><label htmlFor={`url-${index}`}>HTTPS URL {index + 1}</label><input id={`url-${index}`} value={anchor.url} onChange={(event) => updateAnchor(index, { url: event.target.value })} placeholder="https://…" required /></div><div className="field"><label htmlFor={`kind-${index}`}>Source kind</label><select id={`kind-${index}`} value={anchor.sourceKind} onChange={(event) => updateAnchor(index, { sourceKind: event.target.value as SourceKind })}><option>PUBLICATION</option><option>VERSIONED_SOURCE</option><option>ONCHAIN_RECORD</option><option>THIRD_PARTY_RECORD</option></select></div><div className="field"><label htmlFor={`purpose-${index}`}>Purpose</label><input id={`purpose-${index}`} value={anchor.purpose} onChange={(event) => updateAnchor(index, { purpose: event.target.value })} placeholder="What this proves" required /></div>{anchors.length > 1 ? <button type="button" className="icon-button" onClick={() => setAnchors((items) => items.filter((_, current) => current !== index))} aria-label={`Remove anchor ${index + 1}`}>Remove</button> : null}</div>)}{anchors.length < 5 ? <button type="button" className="secondary-button" onClick={() => setAnchors((items) => [...items, { ...initialAnchor }])}>+ Add another anchor</button> : null}</section>{error ? <div className="error-box">{error}</div> : null}{submitted && finalized ? <div className="success-box">Issuance finalized. {commitmentId ? <Link className="text-link" href={`/commitment/${commitmentId}`}>Open commitment #{commitmentId}</Link> : null} / <Link className="text-link" href="/activity">view transaction</Link>.</div> : null}{submitted && !finalized && !error ? <div className="hint">Transaction submitted; waiting for finalized execution.</div> : null}<button className="primary-button" type="submit" disabled={submitting}>{submitting ? "Waiting for finality…" : "Freeze and issue commitment"}</button></div><aside className="summary-box"><h3>Before you sign</h3><div className="summary-line"><span>Maturity</span><strong>{maturity ? new Date(maturity).toLocaleString() : "—"}</strong></div><div className="summary-line"><span>Final review</span><strong>{deadline ? new Date(deadline).toLocaleString() : "—"}</strong></div><div className="summary-line"><span>Bond</span><strong>{(() => { try { return formatGen(parseGen(bond)); } catch { return "—"; } })()}</strong></div><div className="summary-line"><span>Anchors</span><strong>{anchors.length} / 5</strong></div><div className="warning-box">Issuance is irreversible. VOWMARK has no issuer cancellation, admin override, or post-maturity evidence replacement.</div></aside></form></div>;
}
