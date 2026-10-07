"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readRegistry } from "@/lib/genlayer";
import { normalizeCommitment, type Commitment } from "@/lib/types";
import { CommitmentCard } from "@/components/CommitmentCard";

function group(commitments: Commitment[], now: bigint) {
  return {
    due: commitments.filter((item) => item.outcome === "OPEN" && item.maturity_at > now && item.maturity_at - now <= 7n * 24n * 60n * 60n),
    review: commitments.filter((item) => item.outcome === "OPEN" && item.maturity_at <= now),
    resolved: commitments.filter((item) => item.outcome !== "OPEN"),
  };
}

export function HomeBoard() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { readRegistry("list_commitments", [0n, 25n]).then((value) => setCommitments((value as unknown[]).map(normalizeCommitment))).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to read the public board")).finally(() => setLoading(false)); }, []);
  const sections = group(commitments, BigInt(Math.floor(Date.now() / 1000)));
  return (
    <div className="page">
      <section className="hero"><div><p className="eyebrow">A public accountability register</p><h1>Make a promise that can outlive your certainty.</h1><p className="lede">VOWMARK lets an issuer lock GEN behind one externally verifiable commitment. The terms and evidence policy freeze first. After maturity, GenLayer validators review only those public anchors.</p><div className="inline-actions" style={{ marginTop: 28 }}><Link className="primary-button" href="/issue">Make a commitment</Link><Link className="secondary-button" href="/activity">Recover activity</Link></div></div><aside className="hero-aside"><p>THE MATURITY BOARD</p><strong>Promises in public, with a memory.</strong><p>There is no reputation score here. Only the record: what was promised, when the evidence became reviewable, and what the canonical outcome says.</p></aside></section>
      <section><div className="board-heading"><div><p className="eyebrow">Live board</p><h2>What is coming due</h2></div><p>{loading ? "Reading Studionet…" : `${commitments.length} commitment${commitments.length === 1 ? "" : "s"} indexed`}</p></div>
        {error ? <div className="error-box">{error} <span className="muted">Configure NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS to read live state.</span></div> : null}
        <div className="board-grid"><BoardSection title="Due soon" items={sections.due} /><BoardSection title="Ready for review" items={sections.review} /><BoardSection title="Recently resolved" items={sections.resolved} /><div className="board-section"><h3>Reading the register</h3><div className="empty-state">A green outcome is a fulfilled promise. Amber is unresolved or provisional. An expired record is permanent, but never a success label.</div></div></div>
      </section>
    </div>
  );
}

function BoardSection({ title, items }: { title: string; items: Commitment[] }) { return <div className="board-section"><h3>{title}</h3>{items.length ? items.map((item) => <CommitmentCard key={item.commitment_id.toString()} commitment={item} />) : <div className="empty-state">Nothing here yet.</div>}</div>; }
