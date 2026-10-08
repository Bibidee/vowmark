"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { connectWallet, extractExecutionReturn, getWalletState, readRegistry, readVault, waitForFinality, writeVault } from "@/lib/genlayer";
import { formatGen, parseGen, REVIEW_POLICY } from "@/lib/config";
import { rememberActivity, updateActivity } from "@/lib/activity";
import { asBigInt, type SourceKind } from "@/lib/types";

type Anchor = { url: string; sourceKind: SourceKind; purpose: string };
const initialAnchor: Anchor = { url: "", sourceKind: "PUBLICATION", purpose: "" };

function unix(value: string) { return BigInt(Math.floor(new Date(value).getTime() / 1000)); }
function localValue(secondsFromNow: number) { return new Date(Date.now() + secondsFromNow * 1000).toISOString().slice(0, 16); }
function specimenDate(value: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : `${parsed.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
function sameAddress(left: unknown, right: string) { return typeof left === "string" && left.toLowerCase() === right.toLowerCase(); }

async function readIssuanceAfterRegistration(commitmentId: bigint) {
  let issuance = await readVault("get_issuance", [commitmentId]) as Record<string, unknown>;
  for (let attempt = 0; attempt < 20 && issuance.registered !== true; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    issuance = await readVault("get_issuance", [commitmentId]) as Record<string, unknown>;
  }
  return issuance;
}

export function IssueForm() {
  const [statement, setStatement] = useState("");
  const [rule, setRule] = useState("");
  const [maturity, setMaturity] = useState("");
  const [deadline, setDeadline] = useState("");
  const [remedy, setRemedy] = useState("");
  const [bond, setBond] = useState("1");
  const [anchors, setAnchors] = useState<Anchor[]>([initialAnchor]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [commitmentId, setCommitmentId] = useState("");
  const [finalized, setFinalized] = useState(false);
  const [registrationPending, setRegistrationPending] = useState(false);
  const [retryingRegistration, setRetryingRegistration] = useState(false);
  const [recoveryHash, setRecoveryHash] = useState("");
  const [issuance, setIssuance] = useState<Record<string, unknown>>();
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setMaturity(localValue(7 * 24 * 60 * 60));
    setDeadline(localValue(14 * 24 * 60 * 60));
  }, []);
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
    if (deadlineSeconds - maturitySeconds < BigInt(REVIEW_POLICY.minimumWindowSeconds)) throw new Error("The review window must be at least 15 minutes.");
    if (!/^0x[0-9a-fA-F]{40}$/.test(remedy) || /^0x0{40}$/i.test(remedy)) throw new Error("Enter a valid nonzero remedy address.");
    if (anchors.some((item) => !item.url.startsWith("https://") || !item.purpose.trim())) throw new Error("Every evidence anchor needs an HTTPS URL and purpose.");
  }

  function verifyIssuanceTerms(value: Record<string, unknown>, actualId: bigint, issuer: string) {
    if (
      asBigInt(value.commitment_id) !== actualId
      || !sameAddress(value.issuer, issuer)
      || !sameAddress(value.remedy, remedy)
      || value.statement !== statement.trim()
      || value.verification_rule !== rule.trim()
      || asBigInt(value.maturity_at) !== maturitySeconds
      || asBigInt(value.final_review_deadline) !== deadlineSeconds
      || asBigInt(value.bond) !== parseGen(bond)
    ) throw new Error("Finalized Vault issuance did not match the signed commitment terms.");
  }

  async function markOriginalRegistered(actualId: bigint, originalHash = submitted) {
    await readRegistry("get_commitment", [actualId]);
    updateActivity(originalHash, { state: "REGISTERED", commitmentId: actualId.toString(), error: undefined });
    setRegistrationPending(false);
    setFinalized(true);
  }

  async function retryRegistration() {
    if (!submitted || !commitmentId) return;
    setError(""); setRetryingRegistration(true);
    let retryHash = "";
    let registrationStillPending = false;
    try {
      let wallet = await getWalletState().catch(() => null);
      if (!wallet?.address) wallet = await connectWallet();
      if (!wallet.isCorrectNetwork) throw new Error("Switch your wallet to GenLayer Studionet before retrying registration.");
      if (issuance?.issuer && !sameAddress(issuance.issuer, wallet.address)) throw new Error("Connect the issuer wallet that created this commitment to retry registration.");
      retryHash = String(await writeVault(wallet.address, "retry_registration", [BigInt(commitmentId)]));
      setRecoveryHash(retryHash);
      rememberActivity({ hash: retryHash, kind: "registration", label: `Retry Registry registration #${commitmentId}`, commitmentId, issuer: wallet.address, state: "SUBMITTED", createdAt: new Date().toISOString() });
      await waitForFinality(retryHash);
      updateActivity(retryHash, { state: "FINALIZED_EXECUTION" });
      const current = await readIssuanceAfterRegistration(BigInt(commitmentId));
      setIssuance(current);
      if (current.registered !== true) {
        registrationStillPending = true;
        updateActivity(retryHash, { state: "REGISTRATION_PENDING", error: "Registry registration is still pending after the finalized retry." });
        throw new Error("The retry finalized, but Registry registration is still pending. Keep this transaction in Activity and retry again.");
      }
      await markOriginalRegistered(BigInt(commitmentId));
      updateActivity(retryHash, { state: "REGISTERED", error: undefined });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Registry registration retry failed.";
      if (retryHash) updateActivity(retryHash, { state: registrationStillPending ? "REGISTRATION_PENDING" : "FAILED", error: message });
      setError(message);
    } finally { setRetryingRegistration(false); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setSubmitted(""); setCommitmentId(""); setFinalized(false); setRegistrationPending(false); setIssuance(undefined); setSubmitting(true);
    let txHash = "";
    try {
      validate();
      let wallet = await getWalletState().catch(() => null);
      if (!wallet?.address) wallet = await connectWallet();
      if (!wallet.isCorrectNetwork) throw new Error("Switch your wallet to GenLayer Studionet before signing.");
      txHash = String(await writeVault(wallet.address, "create_commitment", [statement, rule, maturitySeconds, deadlineSeconds, remedy, anchors.map((item) => item.url), anchors.map((item) => item.sourceKind), anchors.map((item) => item.purpose)], parseGen(bond)));
      setSubmitted(txHash);
      rememberActivity({ hash: txHash, kind: "issue", label: "Issue commitment", issuer: wallet.address, state: "SUBMITTED", createdAt: new Date().toISOString() });
      const receipt = await waitForFinality(txHash);
      updateActivity(txHash, { state: "FINALIZED_EXECUTION" });
      const actualId = extractExecutionReturn(receipt);
      if (actualId === undefined || actualId < 0n) throw new Error("Finalized issuance did not return a canonical commitment id.");
      setCommitmentId(actualId.toString());
      const current = await readIssuanceAfterRegistration(actualId);
      setIssuance(current);
      verifyIssuanceTerms(current, actualId, wallet.address);
      updateActivity(txHash, { state: "ISSUANCE_FOUND", commitmentId: actualId.toString() });
      if (current.registered !== true) {
        updateActivity(txHash, { state: "REGISTRATION_PENDING", commitmentId: actualId.toString() });
        setRegistrationPending(true);
        return;
      }
      await markOriginalRegistered(actualId, txHash);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "The commitment could not be submitted.";
      if (txHash) updateActivity(txHash, { state: "FAILED", error: message });
      setError(message);
    } finally { setSubmitting(false); }
  }

  return (
    <div className="page form-page">
      <div className="form-intro">
        <p className="eyebrow">02 / Issue / freeze the terms</p>
        <h1>Put GEN behind the thing you say.</h1>
        <p className="lede">Your signature locks the statement, verification rule, deadline, remedy address, evidence policy and bond together. The Vault receives the bond first; the Registry records the commitment through a finalized no-value message.</p>
      </div>
      <form className="form-layout issue-layout" onSubmit={submit}>
        <div>
          <div className="stage-rail" aria-label="Issuance stages">
            <span className="active">01 / PROMISE</span><span>02 / CLOCK</span><span>03 / REMEDY</span><span>04 / EVIDENCE</span><span>05 / LOCK</span>
          </div>
          <section className="form-section">
            <h2>01 / Your word</h2>
            <div className="field"><label htmlFor="statement">The commitment</label><textarea id="statement" value={statement} onChange={(event) => setStatement(event.target.value)} placeholder="Write the thing you are willing to put GEN behind..." maxLength={2000} required /><span className="hint">State one externally verifiable outcome. Avoid subjective words like “excellent” or “satisfactory.”</span></div>
            <div className="field"><label htmlFor="rule">The test</label><textarea id="rule" value={rule} onChange={(event) => setRule(event.target.value)} placeholder="Tell validators what undeniable proof looks like..." maxLength={3000} required /><span className="hint">Explain what the frozen public evidence must establish, including how the deadline matters.</span></div>
          </section>
          <section className="form-section">
            <h2>02 / The clock &amp; remedy</h2>
            <div className="field-row"><div className="field"><label htmlFor="maturity">When the clock stops</label><input id="maturity" type="datetime-local" value={maturity} onChange={(event) => setMaturity(event.target.value)} required /></div><div className="field"><label htmlFor="deadline">Last call for judgment</label><input id="deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} required /></div></div><p className="hint">The final review deadline must be at least 15 minutes after maturity. Review retries use a 5-minute per-reviewer cooldown, with 32 attempts per 1-hour epoch.</p>
            <div className="field"><label htmlFor="remedy">If you break it</label><input id="remedy" value={remedy} onChange={(event) => setRemedy(event.target.value)} placeholder="0x... where the bond goes if BREACHED" spellCheck={false} required /><span className="hint">A nonzero address different from yours. This is immutable and receives the bond only if validators conclude BREACHED.</span></div>
            <div className="field"><label htmlFor="bond">Skin in the game / GEN</label><input id="bond" inputMode="decimal" value={bond} onChange={(event) => setBond(event.target.value)} placeholder="How much GEN backs your word?" required /><span className="hint">The bond is held by the Vault from issuance and can only leave through an evidenced terminal outcome or withdrawal.</span></div>
          </section>
          <section className="form-section">
            <h2>03 / Evidence cartridges</h2>
            <p className="hint" style={{ marginBottom: 16 }}>Validators fetch only these exact HTTPS URLs. Do not include private links, credentials, or a source that needs a reviewer-authored explanation.</p>
            {anchors.map((anchor, index) => <div className="anchor-row" key={index}><div className="field"><label htmlFor={`url-${index}`}>Evidence node // {String(index + 1).padStart(2, "0")}</label><input id={`url-${index}`} value={anchor.url} onChange={(event) => updateAnchor(index, { url: event.target.value })} placeholder="Drop the exact public proof location here..." required /></div><div className="field"><label htmlFor={`kind-${index}`}>Source type</label><select id={`kind-${index}`} value={anchor.sourceKind} onChange={(event) => updateAnchor(index, { sourceKind: event.target.value as SourceKind })}><option>PUBLICATION</option><option>VERSIONED_SOURCE</option><option>ONCHAIN_RECORD</option><option>THIRD_PARTY_RECORD</option></select></div><div className="field"><label htmlFor={`purpose-${index}`}>What does this source prove?</label><input id={`purpose-${index}`} value={anchor.purpose} onChange={(event) => updateAnchor(index, { purpose: event.target.value })} placeholder="Name the fact this anchor carries..." required /></div>{anchors.length > 1 ? <button type="button" className="icon-button" onClick={() => setAnchors((items) => items.filter((_, current) => current !== index))} aria-label={`Remove evidence node ${index + 1}`}>Remove</button> : null}</div>)}
            {anchors.length < 5 ? <button type="button" className="secondary-button" onClick={() => setAnchors((items) => [...items, { ...initialAnchor }])}>+ Insert evidence node</button> : null}
          </section>
          {error ? <div className="error-box" role="alert" aria-live="assertive">{error}</div> : null}
          {registrationPending ? <div className="warning-box registration-recovery" role="status" aria-live="polite"><strong>ISSUED / REGISTRATION PENDING</strong><span>Vault issuance #{commitmentId} is finalized and the bond is held. The Registry child has not confirmed yet.</span><span>Original transaction: <Link className="text-link" href="/activity">{submitted ? submitted.slice(0, 10) : "view Activity"}</Link>{recoveryHash ? ` / retry ${recoveryHash.slice(0, 10)}` : ""}</span><button type="button" className="secondary-button" onClick={retryRegistration} disabled={retryingRegistration}>{retryingRegistration ? "Waiting for registration finality…" : "Retry Registry registration"}</button></div> : null}
          {submitted && finalized ? <div className="success-box" role="status" aria-live="polite">Issuance finalized and registered. {commitmentId ? <Link className="text-link" href={`/commitment/${commitmentId}`}>Open commitment #{commitmentId}</Link> : null} / <Link className="text-link" href="/activity">view transaction</Link>.</div> : null}
          {submitted && !finalized && !registrationPending && !error ? <div className="hint" role="status" aria-live="polite">Transaction submitted; waiting for finalized execution.</div> : null}
          <button className="primary-button" type="submit" disabled={submitting || retryingRegistration}>{submitting ? "Waiting for finality…" : "Freeze and issue commitment"}</button>
        </div>
        <aside className={`vow-specimen${finalized ? " sealed" : ""}${registrationPending ? " pending" : ""}`} aria-label="Live vow specimen preview">
          <div className="vow-specimen-header"><div><span className="specimen-code">VOW / {commitmentId || "DRAFT"}</span><h3>Pre-flight record</h3></div><span className="specimen-code">REV. 01</span></div>
          <div className="specimen-watermark" aria-hidden="true">{finalized ? "SEALED" : registrationPending ? "PENDING" : "UNSEALED"}</div>
          <div className="specimen-seal">{finalized ? "SEALED / FINALIZED" : registrationPending ? "ISSUED / REGISTRATION PENDING" : "UNSEALED / DRAFT"}</div>
          <div className="specimen-meta">
            <div className="summary-line"><span>Clock stops</span><strong>{specimenDate(maturity)}</strong></div>
            <div className="summary-line"><span>Last call</span><strong>{specimenDate(deadline)}</strong></div>
            <div className="summary-line"><span>Bond</span><strong>{(() => { try { return formatGen(parseGen(bond)); } catch { return "—"; } })()}</strong></div>
            <div className="summary-line"><span>Evidence nodes</span><strong>{anchors.length} / 5</strong></div>
            <div className="summary-line"><span>Remedy</span><strong>{remedy ? `${remedy.slice(0, 6)}…${remedy.slice(-4)}` : "UNSET"}</strong></div>
            {issuance?.registered === false ? <div className="summary-line"><span>Vault custody</span><strong>HELD / ON RECORD</strong></div> : null}
          </div>
          <p className="specimen-note">No cancellation. No quiet edits. Once signed and finalized, this shape becomes the record.</p>
        </aside>
      </form>
    </div>
  );
}
