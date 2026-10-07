"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readRegistry } from "@/lib/genlayer";
import { normalizeCommitment, type Commitment, type IssuerSummary } from "@/lib/types";
import { CommitmentCard } from "@/components/CommitmentCard";
import { shortAddress } from "@/lib/config";

export function IssuerView({ address }: { address: string }) {
  const [summary, setSummary] = useState<IssuerSummary>(); const [commitments, setCommitments] = useState<Commitment[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([readRegistry("get_issuer_summary", [address]), readRegistry("get_issuer_commitments", [address, 0n, 25n])]).then(([summaryValue, commitmentValue]) => { const s = summaryValue as Record<string, unknown>; setSummary({ active: BigInt(String(s.active || 0)), fulfilled: BigInt(String(s.fulfilled || 0)), breached: BigInt(String(s.breached || 0)), expired_unresolved: BigInt(String(s.expired_unresolved || 0)) }); setCommitments((commitmentValue as unknown[]).map(normalizeCommitment)); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to read issuer history")).finally(() => setLoading(false)); }, [address]);
  if (loading) return <div className="page"><div className="loading">Reading the issuer record…</div></div>;
  return <div className="page"><section className="issuer-header"><div><p className="eyebrow">Public issuer record</p><h1>{shortAddress(address)}</h1><div className="address-line">{address}</div></div><p className="muted" style={{ maxWidth: 260, lineHeight: 1.5 }}>Chronological history, not a score. Every entry remains public after it resolves.</p></section>{error ? <div className="error-box" style={{ marginTop: 24 }}>{error}</div> : null}{summary ? <div className="count-grid"><div className="count"><strong>{summary.active.toString()}</strong><span>Active / reviewable</span></div><div className="count"><strong>{summary.fulfilled.toString()}</strong><span>Fulfilled</span></div><div className="count"><strong>{summary.breached.toString()}</strong><span>Breached</span></div><div className="count"><strong>{summary.expired_unresolved.toString()}</strong><span>Expired unresolved</span></div></div> : null}<section><p className="eyebrow">Chronological record</p><h2>Commitments by this issuer</h2><div className="activity-list">{commitments.length ? commitments.map((item) => <CommitmentCard key={item.commitment_id.toString()} commitment={item} />) : <p className="empty-state">No commitments are indexed for this address.</p>}</div></section><div style={{ marginTop: 35 }}><Link className="secondary-button" href="/">Back to the Maturity Board</Link></div></div>;
}
