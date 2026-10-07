"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTransaction, readRegistry } from "@/lib/genlayer";
import { loadActivity } from "@/lib/activity";
import type { ActivityRecord } from "@/lib/types";
import { explorerTx, shortHash } from "@/lib/config";

type Reconciled = ActivityRecord & { status: string; execution: string; canonical: string };

function reconcile(transaction: Awaited<ReturnType<typeof getTransaction>>) {
  if (!transaction) return { status: "NOT FOUND", execution: "No transaction returned by RPC" };
  const rawLeader = transaction.consensus_data?.leader_receipt as unknown;
  const leader = Array.isArray(rawLeader) ? rawLeader[0] as { execution_result?: string; error?: string | null } : rawLeader as { execution_result?: string; error?: string | null } | undefined;
  const result = leader?.execution_result || "";
  const error = leader?.error || "";
  const status = String(transaction.status || "UNKNOWN").toUpperCase();
  if (error || (status === "FINALIZED" && !["SUCCESS", "FINISHED_WITH_RETURN"].includes(result))) return { status: "FAILED", execution: error || result || "Finalized without a successful execution result" };
  return { status, execution: result || "Execution result pending" };
}

export function ActivityView() {
  const [items, setItems] = useState<Reconciled[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function refresh() {
      const records = loadActivity();
      const next = await Promise.all(records.map(async (item) => {
        const transaction = await getTransaction(item.hash).catch(() => null);
        const state = reconcile(transaction);
        let canonical = "";
        if (state.status === "FINALIZED" && item.commitmentId) {
          canonical = await readRegistry("get_commitment", [BigInt(item.commitmentId)]).then(() => "canonical commitment readback OK").catch((cause) => cause instanceof Error ? `canonical readback failed: ${cause.message}` : "canonical readback failed");
        }
        return { ...item, ...state, canonical };
      }));
      if (active) { setItems(next); setLoading(false); }
    }
    refresh();
    return () => { active = false; };
  }, []);
  return <div className="page"><section className="form-intro"><p className="eyebrow">Activity / recovery</p><h1>Keep the hash. Read the chain.</h1><p className="lede">Browser storage only remembers hashes. This page reconciles each hash with the RPC transaction record and, for finalized commitment actions, performs a finalized canonical Registry readback.</p></section><section style={{ paddingTop: 42 }}><div className="inline-actions" style={{ justifyContent: "space-between" }}><h2 style={{ marginBottom: 0 }}>Submitted transactions</h2><Link className="secondary-button" href="/">Open the public board</Link></div><div className="activity-list" style={{ marginTop: 24 }}>{loading ? <p className="loading">Reconciling transaction state…</p> : items.length ? items.map((item) => <div className="activity-row" key={item.hash}><div><strong>{item.label}</strong><small>{new Date(item.createdAt).toLocaleString()} {item.commitmentId ? ` / commitment #${item.commitmentId}` : ""}</small><small><span className="status-chip">{item.status}</span> / {item.execution}</small>{item.canonical ? <small>{item.canonical}</small> : null}{item.commitmentId ? <Link className="text-link" href={`/commitment/${item.commitmentId}`}>Open canonical record</Link> : null}</div><a href={explorerTx(item.hash)} target="_blank" rel="noreferrer">{shortHash(item.hash)}</a></div>) : <p className="empty-state">No locally remembered submissions. You can still open any canonical commitment directly.</p>}</div></section></div>;
}
