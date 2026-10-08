"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { connectWallet, getWalletState, readRegistry, readVault, waitForFinality, writeRegistry, writeVault } from "@/lib/genlayer";
import { explorerAddress, formatGen, parseGen, shortAddress } from "@/lib/config";
import { rememberActivity } from "@/lib/activity";
import { asBigInt, normalizeAnchor, normalizeCommitment, normalizeReview, type Commitment, type EvidenceAnchor, type ReviewAttempt, type TransactionStage } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { TransactionRail } from "@/components/TransactionRail";

function date(value: bigint) { return new Date(Number(value) * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); }

function CreditPanel({ refreshKey }: { refreshKey: number }) {
  const [wallet, setWallet] = useState("");
  const [credit, setCredit] = useState<bigint>();
  const [amount, setAmount] = useState("");
  const [hash, setHash] = useState("");
  const [state, setState] = useState("Connect a wallet to inspect credit");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const connected = await getWalletState();
      setWallet(connected.address);
      if (connected.address && connected.isCorrectNetwork) {
        setCredit(asBigInt(await readVault("get_credit", [connected.address])));
        setState("Finalized Vault readback");
      }
    } catch { setWallet(""); setCredit(undefined); }
  }, []);
  useEffect(() => { load(); }, [load, refreshKey]);

  async function connect() {
    setError("");
    try { const connected = await connectWallet(); setWallet(connected.address); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Wallet connection failed"); }
  }

  async function withdraw() {
    setError(""); setBusy(true);
    try {
      let connected = await getWalletState().catch(() => null);
      if (!connected?.address) connected = await connectWallet();
      if (!connected.isCorrectNetwork) throw new Error("Switch your wallet to GenLayer Studionet before withdrawing.");
      const requested = parseGen(amount);
      if (requested <= 0n) throw new Error("Enter a withdrawal amount greater than zero.");
      if (credit === undefined || requested > credit) throw new Error("The requested amount exceeds finalized Vault credit.");
      const tx = await writeVault(connected.address, "withdraw", [requested]);
      const txHash = String(tx); setHash(txHash); setState("Submitted / waiting for finality");
      rememberActivity({ hash: txHash, kind: "withdraw", label: "Withdraw Vault credit", createdAt: new Date().toISOString() });
      await waitForFinality(txHash); setState("FINALIZED / reading canonical credit");
      await load(); setAmount("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Withdrawal failed"); setState("Execution error"); }
    finally { setBusy(false); }
  }

  return <div className="rail"><h3>Vault credit and withdrawal</h3>{wallet ? <><div className="rail-row"><span>Connected wallet</span><strong>{shortAddress(wallet)}</strong></div><div className="rail-row"><span>Finalized credit</span><strong>{credit === undefined ? "—" : formatGen(credit)}</strong></div><div className="field" style={{ marginTop: 14 }}><label htmlFor="withdraw-amount">Withdraw amount (GEN)</label><input id="withdraw-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.1" disabled={busy} /></div><button className="secondary-button" onClick={withdraw} disabled={busy || credit === undefined || credit === 0n}>{busy ? "Waiting for finality…" : "Withdraw finalized credit"}</button><p className="hint" style={{ margin: "13px 0 0" }}>{state}. Credit is read from the Vault, never inferred from browser activity.</p></> : <><p className="hint">Connect the issuer or remedy wallet to read its finalized Vault credit and withdraw it.</p><button className="secondary-button" onClick={connect}>Connect wallet</button></>}{error ? <div className="error-box" style={{ marginTop: 14 }}>{error}</div> : null}{hash ? <p className="hint" style={{ margin: "13px 0 0" }}>Withdrawal hash: <a className="text-link" href={`/activity`}>view Activity</a></p> : null}</div>;
}

export function CommitmentView({ id }: { id: string }) {
  const [commitment, setCommitment] = useState<Commitment>();
  const [anchors, setAnchors] = useState<EvidenceAnchor[]>([]);
  const [reviews, setReviews] = useState<ReviewAttempt[]>([]);
  const [vaultSettlement, setVaultSettlement] = useState<Record<string, unknown>>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hash, setHash] = useState("");
  const [txStage, setTxStage] = useState<TransactionStage>("IDLE");
  const [txDetail, setTxDetail] = useState("No transaction submitted");
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const load = useCallback(async () => {
    setError("");
    try {
      const numericId = BigInt(id);
      const commitmentValue = normalizeCommitment(await readRegistry("get_commitment", [numericId]));
      setCommitment(commitmentValue);
      const [evidenceValue, reviewValue, settlementValue] = await Promise.all([
        readRegistry("get_evidence", [numericId]),
        readRegistry("get_reviews", [numericId]),
        readVault("get_settlement", [numericId]).catch(() => undefined),
      ]);
      setAnchors((evidenceValue as unknown[]).map(normalizeAnchor));
      setReviews((reviewValue as unknown[]).map(normalizeReview));
      setVaultSettlement(settlementValue as Record<string, unknown> | undefined);
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to read this commitment"); return false; }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const canReview = useMemo(() => Boolean(commitment && commitment.outcome === "OPEN" && Number(commitment.maturity_at) <= Math.floor(Date.now() / 1000) && Number(commitment.final_review_deadline) > Math.floor(Date.now() / 1000)), [commitment]);
  async function walletOrThrow(action: string) {
    let wallet = await getWalletState().catch(() => null);
    if (!wallet?.address) wallet = await connectWallet();
    if (!wallet.isCorrectNetwork) throw new Error(`Switch your wallet to GenLayer Studionet before ${action}.`);
    return wallet.address;
  }
  async function review() {
    setBusy(true); setError("");
    try { const address = await walletOrThrow("reviewing"); const tx = await writeRegistry(address, "review_commitment", [BigInt(id)]); const txHash = String(tx); setHash(txHash); setTxStage("SUBMITTED"); setTxDetail("SUBMITTED / waiting for finality"); rememberActivity({ hash: txHash, kind: "review", label: `Review commitment #${id}`, commitmentId: id, state: "SUBMITTED", createdAt: new Date().toISOString() }); await waitForFinality(txHash); const canonicalReadback = await load(); if (!canonicalReadback) throw new Error("Finalized review execution succeeded, but canonical commitment readback is unavailable."); setTxStage("FINALIZED"); setTxDetail("FINALIZED / canonical commitment readback"); setRefreshKey((value) => value + 1); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Review transaction failed"); setTxStage("ERROR"); setTxDetail("ERROR / review not finalized"); }
    finally { setBusy(false); }
  }
  async function expire() {
    setBusy(true); setError("");
    try { const address = await walletOrThrow("expiring"); const tx = await writeRegistry(address, "expire_commitment", [BigInt(id)]); const txHash = String(tx); setHash(txHash); setTxStage("SUBMITTED"); setTxDetail("SUBMITTED / waiting for finality"); rememberActivity({ hash: txHash, kind: "expire", label: `Expire commitment #${id}`, commitmentId: id, state: "SUBMITTED", createdAt: new Date().toISOString() }); await waitForFinality(txHash); const canonicalReadback = await load(); if (!canonicalReadback) throw new Error("Finalized expiry execution succeeded, but canonical commitment readback is unavailable."); setTxStage("FINALIZED"); setTxDetail("FINALIZED / canonical expiry readback"); setRefreshKey((value) => value + 1); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Expiry transaction failed"); setTxStage("ERROR"); setTxDetail("ERROR / expiry not finalized"); }
    finally { setBusy(false); }
  }
  async function retrySettlement() {
    setBusy(true); setError("");
    try { const address = await walletOrThrow("retrying settlement"); const tx = await writeRegistry(address, "retry_settlement", [BigInt(id)]); const txHash = String(tx); setHash(txHash); setTxStage("SUBMITTED"); setTxDetail("SUBMITTED / settlement retry waiting for finality"); rememberActivity({ hash: txHash, kind: "settlement", label: `Retry settlement #${id}`, commitmentId: id, state: "SUBMITTED", createdAt: new Date().toISOString() }); await waitForFinality(txHash); const canonicalReadback = await load(); if (!canonicalReadback) throw new Error("Finalized settlement retry succeeded, but canonical settlement readback is unavailable."); setTxStage("FINALIZED"); setTxDetail("FINALIZED / canonical settlement readback"); setRefreshKey((value) => value + 1); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Settlement retry failed"); setTxStage("ERROR"); setTxDetail("ERROR / settlement retry not finalized"); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="page"><div className="loading">Reading the canonical commitment record…</div></div>;
  if (error && !commitment) return <div className="page"><div className="error-box">{error}</div><Link className="secondary-button" href="/">Back to the board</Link></div>;
  if (!commitment) return null;
  const displayed = commitment.outcome === "OPEN" && commitment.latest_verdict === "INCONCLUSIVE" ? "INCONCLUSIVE" : commitment.outcome;
  const settlementNeedsRetry = commitment.outcome !== "OPEN" && commitment.settlement_state !== "CREDIT_CONFIRMED";
  return <div className="page"><div className="record-header"><div><p className="eyebrow">Canonical commitment / #{id}</p><h1>{commitment.statement}</h1><p className="muted">Issued by <Link className="text-link" href={`/issuer/${commitment.issuer}`}>{shortAddress(commitment.issuer)}</Link> on {date(commitment.created_at)}</p></div><div className="record-header-aside"><StatusBadge value={displayed} /><p className="muted" style={{ fontSize: 12, marginTop: 12 }}>The public record is the source of truth.</p></div></div><div className="record-grid"><div><section className="record-section"><h2>The verification rule</h2><div className="rule-copy">{commitment.verification_rule}</div></section><section className="record-section"><h2>Fixed terms</h2><div className="details-table"><div>Maturity</div><div>{date(commitment.maturity_at)}</div><div>Final review deadline</div><div>{date(commitment.final_review_deadline)}</div><div>Bond</div><div>{formatGen(commitment.bond)}</div><div>Remedy address</div><div><a className="text-link" href={explorerAddress(commitment.remedy)} target="_blank" rel="noreferrer">{shortAddress(commitment.remedy)}</a></div><div>Settlement</div><div>{commitment.settlement_state} / {formatGen(commitment.bond)} {commitment.settlement_recipient ? `→ ${shortAddress(commitment.settlement_recipient)}` : ""}</div>{vaultSettlement ? <><div>Vault readback</div><div>{String(vaultSettlement.state)} / {vaultSettlement.settled ? "credited once" : "not credited"}</div></> : null}</div></section><section className="record-section"><h2>Frozen evidence receipts</h2>{anchors.map((anchor) => <div className="evidence-receipt" key={anchor.index.toString()}><span className="receipt-index">{Number(anchor.index) + 1}</span><div><a className="receipt-url" href={anchor.url} target="_blank" rel="noreferrer">{anchor.url}</a><div className="receipt-meta">{anchor.source_kind.replaceAll("_", " ")} / {anchor.purpose}</div></div></div>)}</section><section className="record-section"><h2>Lifecycle</h2><div className="timeline"><div className="timeline-item"><strong>ISSUE</strong><span>Terms and evidence frozen / {date(commitment.created_at)}</span></div><div className="timeline-item"><strong>{Number(commitment.maturity_at) <= Math.floor(Date.now() / 1000) ? "MATURE" : "ACTIVE"}</strong><span>Review becomes legal at / {date(commitment.maturity_at)}</span></div><div className="timeline-item"><strong>REVIEW / JUDGMENT</strong><span>{reviews.length ? `${reviews.length} append-only attempt${reviews.length === 1 ? "" : "s"}` : "No review attempt recorded"}</span></div><div className="timeline-item"><strong>SETTLEMENT + PERMANENT RECORD</strong><span>{commitment.outcome === "OPEN" ? "Awaiting a conclusive result or expiry" : `${commitment.outcome.replaceAll("_", " ")} / ${date(commitment.resolved_at)}`}</span></div></div></section><section className="record-section"><h2>Review attempts</h2>{reviews.length ? reviews.map((reviewItem) => <div className="attempt" key={reviewItem.attempt_id.toString()}><span className="attempt-id">Attempt {reviewItem.attempt_id.toString()}</span><div><strong>{reviewItem.verdict}</strong><div className="digest">snapshot {reviewItem.snapshot_digest}</div></div><span className="muted">{date(reviewItem.requested_at)}</span></div>) : <p className="muted">The append-only review history is empty.</p>}</section></div><aside><div className="action-box"><h3>Next legal action</h3><p>{canReview ? "Any wallet may request a review. Validators will fetch only the anchors shown above." : commitment.outcome === "OPEN" ? "This commitment is not currently reviewable. Maturity and the final review deadline are enforced by the contract." : "This commitment has a terminal public outcome. No further review is legal."}</p>{canReview ? <button className="primary-button" onClick={review} disabled={busy}>{busy ? "Following finality…" : "Request review"}</button> : null}{commitment.outcome === "OPEN" && Number(commitment.final_review_deadline) <= Math.floor(Date.now() / 1000) ? <button className="secondary-button" onClick={expire} disabled={busy}>{busy ? "Finalizing…" : "Record expired unresolved"}</button> : null}{settlementNeedsRetry ? <button className="secondary-button" onClick={retrySettlement} disabled={busy}>{busy ? "Retrying…" : "Retry settlement credit"}</button> : null}</div><CreditPanel refreshKey={refreshKey} /><TransactionRail hash={hash} stage={txStage} detail={txDetail} />{error ? <div className="error-box" style={{ marginTop: 18 }}>{error}</div> : null}</aside></div></div>;
}
