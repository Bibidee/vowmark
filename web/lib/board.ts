import type { Commitment } from "./types";

export type BoardCategory =
  | "UPCOMING"
  | "DUE_SOON"
  | "READY_FOR_REVIEW"
  | "INCONCLUSIVE_RETRYABLE"
  | "READY_TO_EXPIRE"
  | "RESOLVED";

const SEVEN_DAYS = 7n * 24n * 60n * 60n;

export function classifyCommitment(commitment: Commitment, now: bigint): BoardCategory {
  if (commitment.outcome !== "OPEN") return "RESOLVED";
  if (commitment.final_review_deadline <= now) return "READY_TO_EXPIRE";
  if (commitment.latest_verdict === "INCONCLUSIVE") return "INCONCLUSIVE_RETRYABLE";
  if (commitment.maturity_at > now) {
    return commitment.maturity_at - now <= SEVEN_DAYS ? "DUE_SOON" : "UPCOMING";
  }
  return "READY_FOR_REVIEW";
}

export function groupCommitments(commitments: Commitment[], now: bigint): Record<BoardCategory, Commitment[]> {
  const groups: Record<BoardCategory, Commitment[]> = {
    UPCOMING: [],
    DUE_SOON: [],
    READY_FOR_REVIEW: [],
    INCONCLUSIVE_RETRYABLE: [],
    READY_TO_EXPIRE: [],
    RESOLVED: [],
  };
  for (const commitment of commitments) groups[classifyCommitment(commitment, now)].push(commitment);
  return groups;
}
