"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { connectWallet, executionFailureDescription, getTransaction, getWalletState, isSuccessfulFinalizedExecution, readRegistry, readVault, waitForFinality, writeVault } from "@/lib/genlayer";
import { loadActivity, rememberActivity, updateActivity } from "@/lib/activity";
import type { ActivityRecord } from "@/lib/types";
import { explorerTx, shortHash, REGISTRY_ADDRESS, VAULT_ADDRESS } from "@/lib/config";

type RegistrationState = "REGISTERED" | "REGISTRATION_PENDING" | "VAULT_ISSUANCE_FOUND";
type Reconciled = ActivityRecord & { status: string; execution: string; canonical?: string; registration?: RegistrationState; issuer?: string; canonicalAvailable?: boolean };

function matchesCurrentDeployment(item: ActivityRecord) {
  return Boolean(
    item.registryAddress && item.vaultAddress &&
    item.registryAddress.toLowerCase() === REGISTRY_ADDRESS.toLowerCase() &&
    item.vaultAddress.toLowerCase() === VAULT_ADDRESS.toLowerCase(),
  );
}

function reconcile(transaction: Awaited<ReturnType<typeof getTransaction>>) {
  if (!transaction) return { status: "NOT FOUND", execution: "No transaction returned by RPC" };
  const status = String(transaction.status || "UNKNOWN").toUpperCase();
  if (status === "UNDETERMINED") return { status, execution: "Consensus did not produce a final product result" };
  if (status !== "FINALIZED") return { status, execution: "Provisional transaction state; finalized execution not observed" };
  if (!isSuccessfulFinalizedExecution(transaction)) return { status: "FAILED", execution: executionFailureDescription(transaction) };
  return { status: "FINALIZED", execution: "FINALIZED EXECUTION OK" };
}

async function readRegistrationState(item: ActivityRecord, transactionState: string) {
  if (!item.commitmentId || item.kind !== "issue" || transactionState !== "FINALIZED") return {};
  if (!matchesCurrentDeployment(item)) {
    return { canonical: "HISTORICAL DEPLOYMENT / finalized hash retained; canonical readback skipped", canonicalAvailable: false };
  }
  const issuance = await readVault("get_issuance", [BigInt(item.commitmentId)]).catch(() => undefined) as Record<string, unknown> | undefined;
  if (!issuance) return { canonical: "Vault issuance readback unavailable" };
  const issuer = typeof issuance.issuer === "string" ? issuance.issuer : item.issuer;
  const registry = await readRegistry("get_commitment", [BigInt(item.commitmentId)]).catch(() => undefined);
  if (registry && issuance.registered === true) {
    updateActivity(item.hash, { state: "REGISTERED", issuer });
    return { canonical: "CANONICAL REGISTERED", registration: "REGISTERED" as const, issuer, canonicalAvailable: true };
  }
  if (issuance.registered === false) {
    updateActivity(item.hash, { state: "REGISTRATION_PENDING", issuer });
    return { canonical: registry ? "REGISTRY FOUND / VAULT CONFIRMATION PENDING" : "REGISTRATION PENDING / VAULT ISSUANCE FOUND", registration: "REGISTRATION_PENDING" as const, issuer, canonicalAvailable: true };
  }
  updateActivity(item.hash, { state: "ISSUANCE_FOUND", issuer });
  return { canonical: "VAULT ISSUANCE FOUND / REGISTRY READBACK PENDING", registration: "VAULT_ISSUANCE_FOUND" as const, issuer, canonicalAvailable: true };
}

async function readUntilRegistered(commitmentId: bigint) {
  let issuance = await readVault("get_issuance", [commitmentId]) as Record<string, unknown>;
  for (let attempt = 0; attempt < 20 && issuance.registered !== true; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    issuance = await readVault("get_issuance", [commitmentId]) as Record<string, unknown>;
  }
  return issuance;
}

function RegistrationRetry({ sourceHash, commitmentId, issuer, onComplete }: { sourceHash: string; commitmentId: string; issuer?: string; onComplete: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function retry() {
    setBusy(true); setError("");
    let retryHash = "";
    let registrationStillPending = false;
    try {
      let wallet = await getWalletState().catch(() => null);
      if (!wallet?.address) wallet = await connectWallet();
      if (!wallet.isCorrectNetwork) throw new Error("Switch your wallet to GenLayer Studionet before retrying registration.");
      if (issuer && wallet.address.toLowerCase() !== issuer.toLowerCase()) throw new Error("Connect the issuer wallet that created this commitment to retry registration.");
      retryHash = String(await writeVault(wallet.address, "retry_registration", [BigInt(commitmentId)]));
      rememberActivity({ hash: retryHash, kind: "registration", label: `Retry Registry registration #${commitmentId}`, commitmentId, issuer: wallet.address, state: "SUBMITTED", createdAt: new Date().toISOString() });
      await waitForFinality(retryHash);
      updateActivity(retryHash, { state: "FINALIZED_EXECUTION" });
      const issuance = await readUntilRegistered(BigInt(commitmentId));
      if (issuance.registered !== true) {
        registrationStillPending = true;
        updateActivity(retryHash, { state: "REGISTRATION_PENDING", error: "Registry registration is still pending after the finalized retry." });
        throw new Error("The retry finalized, but Registry registration is still pending.");
      }
      await readRegistry("get_commitment", [BigInt(commitmentId)]);
      updateActivity(sourceHash, { state: "REGISTERED", issuer: typeof issuance.issuer === "string" ? issuance.issuer : issuer });
      updateActivity(retryHash, { state: "REGISTERED" });
      onComplete();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Registry registration retry failed.";
      if (retryHash) updateActivity(retryHash, { state: registrationStillPending ? "REGISTRATION_PENDING" : "FAILED", error: message });
      setError(message);
    } finally { setBusy(false); }
  }
  return <div className="activity-recovery"><button type="button" className="secondary-button" onClick={retry} disabled={busy}>{busy ? "Waiting for registration finality…" : "Retry Registry registration"}</button>{error ? <small className="recovery-error" role="alert">{error}</small> : null}</div>;
}

export function ActivityView() {
  const [items, setItems] = useState<Reconciled[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    let active = true;
    async function refresh() {
      const records = loadActivity();
      const next = await Promise.all(records.map(async (item) => {
        const transaction = await getTransaction(item.hash).catch(() => null);
        const state = reconcile(transaction);
        if (state.status === "FINALIZED") updateActivity(item.hash, { state: state.execution === "FINALIZED EXECUTION OK" ? "FINALIZED_EXECUTION" : "FAILED" });
        else if (state.status === "UNDETERMINED") updateActivity(item.hash, { state: "UNDETERMINED" });
        else if (state.status === "ACCEPTED") updateActivity(item.hash, { state: "ACCEPTED" });
        const registration = await readRegistrationState(item, state.status).catch(() => ({}));
        return { ...item, canonicalAvailable: matchesCurrentDeployment(item), ...state, ...registration };
      }));
      if (active) { setItems(next); setLoading(false); }
    }
    refresh();
    return () => { active = false; };
  }, [refreshKey]);
  return <div className="page"><section className="form-intro"><p className="eyebrow">Activity / recovery</p><h1>Keep the hash. Read the chain.</h1><p className="lede">Browser storage remembers hashes only. This page reconciles each transaction with finalized RPC state. Records saved by the current deployment also receive Vault and Registry canonical readback.</p></section><section style={{ paddingTop: 42 }}><div className="inline-actions" style={{ justifyContent: "space-between" }}><h2 style={{ marginBottom: 0 }}>Transaction trace</h2><Link className="secondary-button" href="/">Open the public board</Link></div><div className="activity-list" style={{ marginTop: 24 }}>{loading ? <p className="loading">Reconciling transaction state…</p> : items.length ? items.map((item) => <div className="activity-row" key={item.hash}><div><strong>{item.label}</strong><small>{new Date(item.createdAt).toLocaleString()} {item.commitmentId ? ` / commitment #${item.commitmentId}` : ""}</small><small><span className={`status-chip status-${item.registration === "REGISTRATION_PENDING" ? "pending" : item.status.toLowerCase()}`}>{item.registration === "REGISTRATION_PENDING" ? "REGISTRATION PENDING" : item.registration === "REGISTERED" ? "REGISTERED" : item.status.replaceAll("_", " ")}</span> / {item.execution}</small>{item.canonical ? <small>{item.canonical}</small> : null}{item.commitmentId && item.canonicalAvailable ? <Link className="text-link" href={`/commitment/${item.commitmentId}`}>Open canonical record</Link> : null}{item.registration === "REGISTRATION_PENDING" && item.commitmentId && item.kind === "issue" && item.canonicalAvailable ? <RegistrationRetry sourceHash={item.hash} commitmentId={item.commitmentId} issuer={item.issuer} onComplete={() => setRefreshKey((value) => value + 1)} /> : null}</div><a href={explorerTx(item.hash)} target="_blank" rel="noreferrer">{shortHash(item.hash)}</a></div>) : <p className="empty-state">No locally remembered submissions. You can still open any canonical commitment directly.</p>}</div></section></div>;
}
