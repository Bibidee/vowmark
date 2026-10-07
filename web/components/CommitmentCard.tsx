import Link from "next/link";
import type { Commitment } from "@/lib/types";
import { formatGen, shortAddress } from "@/lib/config";
import { StatusBadge } from "@/components/StatusBadge";

function date(value: bigint) { return new Date(Number(value) * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }

export function CommitmentCard({ commitment }: { commitment: Commitment }) {
  const status = commitment.outcome === "OPEN" && commitment.latest_verdict === "INCONCLUSIVE" ? "INCONCLUSIVE" : commitment.outcome;
  return (
    <Link className="commitment-card" href={`/commitment/${commitment.commitment_id.toString()}`}>
      <div className="inline-actions" style={{ justifyContent: "space-between", marginBottom: 14 }}><StatusBadge value={status} /><span className="muted" style={{ fontSize: 11 }}>#{commitment.commitment_id.toString()}</span></div>
      <p>{commitment.statement}</p>
      <div className="card-meta"><span>Issuer <strong>{shortAddress(commitment.issuer)}</strong></span><span>Matures <strong>{date(commitment.maturity_at)}</strong></span><span>Bond <strong>{formatGen(commitment.bond)}</strong></span></div>
    </Link>
  );
}
