export type Outcome = "OPEN" | "FULFILLED" | "BREACHED" | "EXPIRED_UNRESOLVED";
export type Verdict = "FULFILLED" | "BREACHED" | "INCONCLUSIVE" | "NONE";
export type SourceKind =
  | "PUBLICATION"
  | "VERSIONED_SOURCE"
  | "ONCHAIN_RECORD"
  | "THIRD_PARTY_RECORD";

export type Commitment = {
  commitment_id: bigint;
  issuer: string;
  remedy: string;
  statement: string;
  verification_rule: string;
  created_at: bigint;
  maturity_at: bigint;
  final_review_deadline: bigint;
  bond: bigint;
  outcome: Outcome;
  latest_verdict: Verdict;
  latest_snapshot_digest: string;
  latest_source_set_digest: string;
  attempt_count: bigint;
  last_attempt_at: bigint;
  settlement_scheduled: boolean;
  resolved_at: bigint;
};

export type EvidenceAnchor = {
  index: bigint;
  url: string;
  normalized_url: string;
  source_kind: SourceKind;
  purpose: string;
};

export type ReviewAttempt = {
  attempt_id: bigint;
  requested_by: string;
  requested_at: bigint;
  verdict: Verdict;
  snapshot_digest: string;
  source_set_digest: string;
};

export type IssuerSummary = {
  active: bigint;
  fulfilled: bigint;
  breached: bigint;
  expired_unresolved: bigint;
};

export type ActivityRecord = {
  hash: string;
  label: string;
  commitmentId?: string;
  createdAt: string;
};

export function asBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  return 0n;
}

export function normalizeCommitment(value: unknown): Commitment {
  const item = value as Record<string, unknown>;
  return {
    commitment_id: asBigInt(item.commitment_id),
    issuer: String(item.issuer),
    remedy: String(item.remedy),
    statement: String(item.statement),
    verification_rule: String(item.verification_rule),
    created_at: asBigInt(item.created_at),
    maturity_at: asBigInt(item.maturity_at),
    final_review_deadline: asBigInt(item.final_review_deadline),
    bond: asBigInt(item.bond),
    outcome: item.outcome as Outcome,
    latest_verdict: item.latest_verdict as Verdict,
    latest_snapshot_digest: String(item.latest_snapshot_digest || ""),
    latest_source_set_digest: String(item.latest_source_set_digest || ""),
    attempt_count: asBigInt(item.attempt_count),
    last_attempt_at: asBigInt(item.last_attempt_at),
    settlement_scheduled: Boolean(item.settlement_scheduled),
    resolved_at: asBigInt(item.resolved_at),
  };
}

export function normalizeAnchor(value: unknown): EvidenceAnchor {
  const item = value as Record<string, unknown>;
  return {
    index: asBigInt(item.index),
    url: String(item.url),
    normalized_url: String(item.normalized_url),
    source_kind: item.source_kind as SourceKind,
    purpose: String(item.purpose),
  };
}

export function normalizeReview(value: unknown): ReviewAttempt {
  const item = value as Record<string, unknown>;
  return {
    attempt_id: asBigInt(item.attempt_id),
    requested_by: String(item.requested_by),
    requested_at: asBigInt(item.requested_at),
    verdict: item.verdict as Verdict,
    snapshot_digest: String(item.snapshot_digest),
    source_set_digest: String(item.source_set_digest),
  };
}
